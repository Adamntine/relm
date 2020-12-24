import { World } from "~/types/hecs/World";
import { DeepDiff } from "deep-diff";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { findInYArray, isEntityAttribute, yIdToString } from "./utils";
import { withArrayEdits, withMapEdits } from "./observeUtils";
import {
  YEntities,
  YEntity,
  YComponent,
  YIDSTR,
  HECSID,
  YValues,
  YComponents,
} from "./types";
import { yEntityToJSON, yComponentToJSON } from "./yToJson";
import { jsonToYEntity } from "./jsonToY";

import EventEmitter from "eventemitter3";
import { applyChangeToYEntity } from "./applyDiff";
import { Change } from "./diffTypes";

import { yConnectStatus, ConnectOptions } from "~/stores/connection";

const UNDO_CAPTURE_TIMEOUT = 50;

type Entity = any;
export class WorldDoc extends EventEmitter {
  static index: Map<string, WorldDoc> = new Map();

  // Unique identifier for the world
  name: string;

  // The Hecs world that this document will synchronize with
  world: World;

  // The "root node" (document) containing all specification data for the world
  ydoc: Y.Doc;

  // Yjs synchronization provider
  provider: WebsocketProvider;

  // The array of entities stored in the Y.Doc. We store entities as a Y.Array
  // rather than a Y.Map because, per Yjs docs, this allows nodes to be garbage
  // collected when entities are removed from the Y.Doc.
  entities: YEntities;

  // A record of Y.IDs (as strings) mapped to HECS IDs; used for deletion
  yids: Map<YIDSTR, HECSID>;

  // A record of HECS IDs mapped to YEntity; used for fast lookup
  hids: Map<HECSID, YEntity>;

  // An UndoManager allowing users to undo/redo edits on `entities`
  undoManager: Y.UndoManager;

  constructor({ name, world }: { name: string; world: World }) {
    super();
    this.name = name;
    this.world = world;
    this.ydoc = new Y.Doc();
    this.entities = this.ydoc.getArray("entities");
    this.yids = new Map();
    this.hids = new Map();
    this.undoManager = new Y.UndoManager([this.entities], {
      captureTimeout: UNDO_CAPTURE_TIMEOUT,
    });

    this.entities.observeDeep(this._observer.bind(this));

    WorldDoc.index.set(name, this);
  }

  connect(connection: ConnectOptions) {
    this.provider = new WebsocketProvider(
      connection.url,
      connection.room,
      this.ydoc
    );
    this.provider.on("sync", () => {
      // TODO: start physics
    });
    this.provider.on(
      "status",
      ({ status }: { status: "connecting" | "connected" | "disconnected" }) => {
        yConnectStatus.set(status);
      }
    );
  }

  disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
  }

  reapplyWorld() {
    this.entities.forEach((yentity) => {
      const yid = yIdToString(yentity._item.id);
      if (this.yids.has(yid)) {
        this._applyYEntity(yentity);
      } else {
        this._addYEntity(yentity);
      }
    });
  }

  // Update WorldDoc based on any new or updated entity
  syncFrom(entity: Entity) {
    if (this.hids.has(entity.id)) {
      /* Update existing WorldDoc entity */

      const yentity = this.hids.get(entity.id);
      const before = yEntityToJSON(yentity);
      const after = entity.toJSON();

      const diff = DeepDiff(before, after);
      if (diff) {
        this.ydoc.transact(() => {
          diff.forEach((change: Change) => {
            applyChangeToYEntity(change, yentity);
          });
        });
      }
    } else {
      /* This entity is new to WorldDoc */

      this._add(entity);
    }
  }

  delete(entity: Entity) {
    this.ydoc.transact(() => {
      this._deleteRecursive(entity);
    });
  }

  _deleteRecursive(entity: Entity) {
    const yentity = this.hids.get(entity.id);
    if (!yentity) {
      console.warn(
        `Can't delete entity from worldDoc, does not exist`,
        entity.id
      );
      return;
    }

    // Recursively delete children before parent
    entity.getChildren().forEach((childEntity) => {
      this.delete(childEntity);
    });

    const yid = yentity._item.id;
    findInYArray(
      this.entities,
      (yentity) => yentity.get("id") === entity.id,
      (_yentity, index) => this.entities.delete(index, 1)
    );
    entity.destroy();
    this.yids.delete(yIdToString(yid));
    this.hids.delete(entity.id);
  }

  getJson(entity) {
    const yentity = this.hids.get(entity.id);
    if (yentity) {
      return yEntityToJSON(yentity);
    }
  }

  _add(entity: Entity) {
    this.ydoc.transact(() => {
      const data = entity.toJSON();
      const yentity = jsonToYEntity(data);
      this.entities.push([yentity]);
      this.yids.set(yIdToString(yentity._item.id), entity.id);
      this.hids.set(entity.id, yentity);
    });
  }

  _getEntityFromEventPath(path) {
    if (path.length > 0) {
      const index = path[0] as number;
      const yentity: YEntity = this.entities.get(index);
      const yid = yentity._item.id;
      const hid = this.yids.get(yIdToString(yid));
      return this.world.entities.getById(hid);
    } else {
      throw new Error(`path length must be at least 1`);
    }
  }

  _observer(events: Array<Y.YEvent>, transaction: Y.Transaction) {
    if (
      transaction.origin &&
      transaction.origin.constructor === Y.UndoManager
    ) {
      // If this is an undo/redo event, we need to apply it locally
      console.log("undo/redo observed", events);
    } else if (transaction.local) {
      // If this is a local event, we should ignore it because the "diff"
      // represented by this YEvent has already been applied to the HECS
      // world.
      return;
    }

    for (const event of events) {
      if (event.path.length === 0) {
        // Adding to or deleting from YEntities
        withArrayEdits(event as Y.YArrayEvent<YEntity>, {
          onAdd: (yentity) => {
            this._addYEntity(yentity);
          },
          onDelete: (yid) => {
            this._deleteYEntity(yid);
          },
        });
      } else if (event.path.length === 2) {
        const entity = this._getEntityFromEventPath(event.path);

        if (isEntityAttribute(event.path[1] as string)) {
          const attr = event.path[1] as string;
          if (attr === "name") {
            withMapEdits(event as Y.YMapEvent<string>, {
              onUpdate: (key, content) => {
                entity.name = content;
              },
            });
          } else if (attr === "parent") {
            withMapEdits(event as Y.YMapEvent<string>, {
              onUpdate: (key, parentEntityId: string) => {
                const parent = this.world.entities.getById(parentEntityId);
                entity.setParent(parent);
              },
            });
          } else if (attr === "children") {
            withArrayEdits(event as Y.YArrayEvent<string>, {
              onAdd: (childEntityId: string) => {
                const child = this.world.entities.getById(childEntityId);
                child.setParent(entity);
              },
              onDelete: (yid) => {
                console.log("update children onDelete", yid);
              },
            });
          } else {
            throw new Error(`Can't update attribute: ${attr}`);
          }
        } else {
          // Adding to or deleting from YComponents
          withArrayEdits(event as Y.YArrayEvent<YComponent>, {
            onAdd: (ycomponent) => {
              this._addYComponent(entity, ycomponent);
            },
            onDelete: (yid) => {
              this._deleteYComponent(entity, event.path[1] as string);
            },
          });
        }
      } else if (event.path.length === 4 && event.path[1] === "components") {
        // Update a component's values
        // e.g. event.path = [ 0, "components", 2, "values" ]
        const entity = this._getEntityFromEventPath(event.path);

        withMapEdits(event as Y.YMapEvent<YValues>, {
          onUpdate: (key, content, oldContent) => {
            const componentName = (this.entities
              .get(event.path[0] as number)
              .get("components") as YComponents)
              .get(event.path[2] as number)
              .get("name");
            const component = entity.getByName(componentName);

            // Similar to HECS Component.fromJSON, but for just one prop
            const prop = component.constructor.props[key];
            const type = prop.type || prop;
            component[key] = type.fromJSON(content, component[key]);

            // Mark as modified so any updates can occur
            component.modified();
          },
        });

        // const ycomponent =

        // this._updateYComponent(entity, ycomponent)
      } else {
        console.warn("unknown _observer event", event.path);
      }
    }
  }

  _addYEntity(yentity: YEntity) {
    const yid = yIdToString(yentity._item.id);
    if (this.yids.has(yid)) {
      console.warn(`entity already exists, won't add`, this.yids.get(yid));
      return;
    }

    // Convert YEntity hierarchy to HECS-compatible JSON
    const data = yEntityToJSON(yentity);

    // Create a HECS entity and immediately initialize it with data
    const entity = this.world.entities.create().fromJSON(data);

    // Keep map of Y.ID to entity.id for potential later deletion
    this.yids.set(yid, entity.id);
    this.hids.set(entity.id, yentity);

    // let ECS know this entity has had all of its initial components added
    entity.activate();
    // console.log("_addYEntity", yentity, entity);

    // Signal completion of onAdd for tests
    this.emit("entities.added", entity);
  }

  _applyYEntity(yentity: YEntity) {
    const yid = yIdToString(yentity._item.id);
    if (!this.yids.has(yid)) {
      console.warn(`entity not found, won't apply`, yid);
      return;
    }

    const hid = this.yids.get(yid);

    // Convert YEntity hierarchy to HECS-compatible JSON
    const data = yEntityToJSON(yentity);

    const entity = this.world.entities.getById(hid).fromJSON(data);

    // entity.activate();

    this.emit("entities.applied", entity);
  }

  _deleteYEntity(yid: Y.ID) {
    const id = this.yids.get(yIdToString(yid));
    const entity = this.world.entities.getById(id);

    if (entity) {
      entity.destroy();

      // Signal completion of onDelete for tests
      this.emit("entities.deleted", id);
    } else {
      console.warn(`Can't delete entity, not found: ${id}`);
    }
  }

  _addYComponent(entity: Entity, ycomponent: YComponent) {
    // Get the right Component class
    const key = ycomponent.get("name");
    const Component = this.world.components.getByName(key);

    // Initialize from raw JSON
    const data = yComponentToJSON(ycomponent);
    const component = new Component(this.world).fromJSON(data);

    entity.add(component);

    // Signal completion of onAdd for tests
    this.emit("ycomponents.added", component, entity);
  }

  _deleteYComponent(entity: Entity, componentName: string) {
    console.error("deleteYComponent not implemented", componentName, entity.id);
  }
}