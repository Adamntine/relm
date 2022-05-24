import type { DecoratedECSWorld, Participant } from "~/types";

import { Vector3, Quaternion } from "three";

import { Entity, EntityId } from "~/ecs/base";
import { BoneAttach } from "~/ecs/plugins/bone-attach";
import { Asset, Transform } from "~/ecs/plugins/core";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { createPrefab } from "~/prefab";
import { makeBox } from "~/prefab/makeBox";
import { inFrontOf } from "~/utils/inFrontOf";
import { makeEntity } from "~/prefab/makeEntity";
import { Model } from "~/ecs/plugins/model";
import { FaceMapColors } from "~/ecs/plugins/coloration";
import { Item } from "~/ecs/plugins/item";

const HAND_LENGTH = 0.25;

export class Inventory {
  api: RelmRestAPI;
  world: DecoratedECSWorld;
  participant: Participant;

  assets: any[];
  heldEntity: Entity;

  get heldAsset() {
    return this.assets[0];
  }

  get firstHeldEntityJSON() {
    return this.heldAsset?.ecsProperties.entities[0];
  }

  constructor(
    api: RelmRestAPI,
    world: DecoratedECSWorld,
    participant: Participant
  ) {
    this.api = api;
    this.world = world;
    this.participant = participant;
  }

  async init() {
    await this.loadAssets();
  }

  async loadAssets() {
    this.assets = await this.api.itemQuery();
    this.syncIndicator();
  }

  syncIndicator() {
    if (this.assets && this.assets.length > 0) {
      this.showHoldingIndicator();
    } else {
      this.removeHoldingIndicator();
    }
  }

  async take(entityId: EntityId) {
    const entity = this.world.entities.getById(entityId);

    const yCenter =
      entity.get(Transform).position.y - this.participant.avatar.position.y;

    const asset = await this.api.itemTake({
      entityId: entity.id as string,
      yCenter,
    });

    this.assets.unshift(asset);

    this.syncIndicator();
  }

  async drop(assetId?: string) {
    if (!assetId) {
      if (this.heldAsset) {
        assetId = this.heldAsset.assetId;
      } else {
        console.warn("No items to drop");
        return;
      }
    }

    const transform = this.participant.avatar.transform;
    const position = inFrontOf(transform.position, transform.rotation);

    const result = await this.api.itemDrop({
      assetId,
      position: position.toArray(),
    });

    if (result) {
      this.assets.shift();
      this.syncIndicator();
    } else {
      console.error("Unable to drop item");
    }
  }

  makeHeldEntity() {
    const json = this.firstHeldEntityJSON;
    const model = json.Model;

    let entity: Entity;

    if (model) {
      entity = makeEntity(this.world, "Held")
        .add(Transform)
        .add(Model, {
          asset: new Asset(model.asset.url),
        });

      if (json.FaceMapColors) {
        entity.add(FaceMapColors, {
          colors: JSON.parse(json.FaceMapColors.colors),
        });
      }
    } else {
      entity = makeBox(this.world, {
        name: "Held",
        w: 0.8,
        h: 0.8,
        d: 0.8,
        color: "#ff0000",
        collider: false,
      });
    }

    return entity.activate();
  }

  showHoldingIndicator() {
    this.heldEntity = this.makeHeldEntity();

    const attachParams = this.getBoneAttachParams();

    const item = new Item(this.world).fromJSON(this.firstHeldEntityJSON.Item);
    attachParams.position.add(item.position);
    attachParams.rotation.copy(item.rotation);
    attachParams.scale.copy(item.scale);
    // console.log("attachParams", attachParams, this.firstHeldEntityJSON.Item);

    const avatar = this.participant.avatar;
    if (avatar) {
      avatar.entities.body.add(BoneAttach, {
        entityToAttachId: this.heldEntity.id,
        ...attachParams,
      });
    } else {
      console.warn("Can't showHoldingIndicator: avatar not available");
    }
  }

  removeHoldingIndicator() {
    if (this.heldEntity) {
      const avatar = this.participant.avatar;
      if (avatar) {
        avatar.entities.body.remove(BoneAttach);
        this.heldEntity.destroy();
        this.heldEntity = null;
      } else {
        console.warn("Can't removeHoldingIndicator: avatar not available");
      }
    }
  }

  getBoneAttachParams(entity = this.firstHeldEntityJSON) {
    const height = 1.0;
    switch (entity.Item.attach) {
      case "HEAD":
        return {
          boneName: "mixamorigHeadTop_End",
          position: new Vector3(0, height / 2, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1),
        };
      case "BACK":
        return {
          boneName: "mixamorigSpine2",
          position: new Vector3(0, 0, -height / 2 - 0.25),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1),
        };
      default:
        return {
          boneName: "mixamorigRightHand",
          position: new Vector3(0, height / 2 + HAND_LENGTH, 0),
          rotation: new Quaternion(),
          scale: new Vector3(1, 1, 1),
        };
    }
  }

  actionable(): boolean {
    return Boolean(this.firstHeldEntityJSON?.Item.power);
  }

  action() {
    const power = this.firstHeldEntityJSON?.Item.power;
    if (power) {
      const parts = power.split(":");
      if (parts[0] === "make") {
        const name = parts[1];

        // Make the item in front of the avatar
        const transform = this.participant.avatar.transform;
        const position = inFrontOf(transform.position, transform.rotation);
        createPrefab(name, { x: position.x, y: position.y, z: position.z });
      }
    }
  }
}
