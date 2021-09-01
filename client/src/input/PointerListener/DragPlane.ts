import { Vector2, Vector3, Group } from "three";

import { PlaneOrientation, WorldPlanes } from "~/ecs/shared/WorldPlanes";

import { DecoratedWorld } from "~/types/DecoratedWorld";
import { makeDragPlaneHelper } from "./DragPlaneHelper";

export class DragPlane {
  world: DecoratedWorld;
  orientation: PlaneOrientation = "xz";
  planes: WorldPlanes = null;
  group: Group;

  constructor(world: DecoratedWorld) {
    this.world = world;
    this.planes = new WorldPlanes(
      this.world.presentation.camera,
      this.world.presentation.size,
      new Vector3()
    );
  }

  setOrientation(orientation: PlaneOrientation) {
    this.orientation = orientation;
  }

  setOrigin(origin: Vector3) {
    this.planes.origin.copy(origin);
    this.planes.recalculatePlanesConstants();
  }

  getDelta(screenCoord: Vector2) {
    const delta = new Vector3();

    this.planes.getWorldFromScreen(screenCoord, delta, {
      plane: this.orientation,
    });
    delta.sub(this.planes.origin);

    return delta;
  }

  show() {
    if (this.group) this.hide();

    this.group = makeDragPlaneHelper();

    this.group.position.copy(this.planes.origin);
    if (this.orientation == "xz") {
      this.group.rotation.x += Math.PI / 2;
    }

    this.world.presentation.scene.add(this.group);
  }

  hide() {
    if (this.group) {
      this.group.removeFromParent();
      this.group = null;
    }
  }
}