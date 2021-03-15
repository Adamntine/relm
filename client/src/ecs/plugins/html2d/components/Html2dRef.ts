import { StateComponent, RefType } from "~/ecs/base";

export class Html2dRef extends StateComponent {
  static props = {
    container: {
      type: RefType,
    },

    component: {
      type: RefType,
    },
  };
}
