import { Object3D, Group } from "three";
import { StateComponent, RefType } from "~/ecs/base";

export class ModelAttached extends StateComponent {
  parent: Object3D;
  child: Group;

  static props = {
    parent: {
      type: RefType,
    },

    child: {
      type: RefType,
    },
  };
}
