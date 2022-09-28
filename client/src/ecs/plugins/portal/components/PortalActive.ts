import {
  BooleanType,
  Entity,
  LocalComponent,
  NumberType,
  RefType,
} from "~/ecs/base";
import { Vector3 } from "three";

export type Destination =
  | { type: "LOCAL"; coords: Vector3 }
  | { type: "REMOTE"; entryway: string; relm: string };

export class PortalActive extends LocalComponent {
  destination: Destination;
  countdown: number;
  animatedEntity: Entity;
  triggered: boolean;

  static props = {
    destination: {
      type: RefType,
    },

    countdown: {
      type: NumberType,
    },

    // Track the animated entity (probably the Avatar)
    animatedEntity: {
      type: RefType,
    },

    triggered: {
      type: BooleanType,
      default: false,
    },
  };
}
