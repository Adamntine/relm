import {
  BooleanType,
  Component,
  NumberType,
  RefType,
  StringType,
} from "~/ecs/base";
import { Vector3Type } from "~/ecs/plugins/core";
import { Vector3 } from "three";

export class Html2d extends Component {
  kind: string;
  offset: Vector3;
  width: number;
  vanchor: number;
  hanchor: number;
  color: string;
  shadowColor: string;
  underlineColor: string;
  title: string;
  link: string;
  content: string;
  draggable: boolean;
  editable: boolean;
  visible: boolean;
  onChange: Function;
  onClose: Function;

  static props = {
    kind: {
      type: StringType,
      default: "INFO",
      editor: {
        label: "Kind",
        input: "Select",
        options: [
          { label: "Info", value: "INFO" },
          { label: "Label", value: "LABEL" },
          { label: "Speech", value: "SPEECH" },
          { label: "Emoji", value: "EMOJI" },
        ],
      },
    },

    offset: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Position Offset",
      },
    },

    width: {
      type: NumberType,
      default: 3,
      editor: {
        label: "Max. Width",
      },
    },

    vanchor: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Anchor (Vertical)",
        input: "Select",
        options: [
          { label: "Center", value: 0 },
          { label: "Top", value: 1 },
          { label: "Bottom", value: 2 },
        ],
      },
    },

    hanchor: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Anchor (Horz.)",
        input: "Select",
        options: [
          { label: "Center", value: 0 },
          { label: "Left", value: 1 },
          { label: "Right", value: 2 },
        ],
      },
    },

    color: {
      type: StringType,
      default: "#FFFFFF",
      editor: {
        label: "Text Color",
        input: "Color",
      },
    },

    shadowColor: {
      type: StringType,
      default: "#000000",
      editor: {
        label: "Shadow Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    underlineColor: {
      type: StringType,
      default: null,
      editor: {
        label: "Underline Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    title: {
      type: StringType,
      default: null,
      editor: {
        label: "Title",
      },
    },

    link: {
      type: StringType,
      default: null,
      editor: {
        label: "Title Link (URL)",
      },
    },

    content: {
      type: StringType,
      default: null,
      editor: {
        label: "HTML Content",
      },
    },

    draggable: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Draggable",
      },
    },

    editable: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Editable",
      },
    },

    visible: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Visible",
      },
    },

    // Called when done editing
    onChange: {
      type: RefType,
    },

    onClose: {
      type: RefType,
    },
  };

  static editor = {
    label: "Html2d",
  };
}
