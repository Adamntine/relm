import { Component, StringType, NumberType } from "hecs";

export class ThrustController extends Component {
  static props = {
    thrust: {
      type: NumberType,
      default: 30.0,
      editor: {
        label: "Thrust Magnitude",
      },
    },
  };
}