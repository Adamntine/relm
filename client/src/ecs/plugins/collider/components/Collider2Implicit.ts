import type { Vector3 } from "three";

import { LocalComponent } from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";

export class Collider2Implicit extends LocalComponent {
  size: Vector3;

  static props = {
    size: {
      type: Vector3Type,
    },
  };
}
