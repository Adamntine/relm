import { PerspectiveCamera } from "three";

import { World } from "~/ecs/base";

import { createRenderer } from "../../world/createRenderer";
import { createScene } from "../../world/createScene";

import CorePlugin from "~/ecs/plugins/core";
import ShapePlugin from "~/ecs/plugins/shape";
import WallPlugin from "~/ecs/plugins/wall";
import PerspectivePlugin from "~/ecs/plugins/perspective";

import AnimationPlugin from "~/ecs/plugins/animation";
import AssetPlugin from "~/ecs/plugins/asset";
import BloomPlugin from "~/ecs/plugins/bloom";
import BoneAttachPlugin from "~/ecs/plugins/bone-attach";
import BoneTwistPlugin from "~/ecs/plugins/bone-twist";
import BoundingBoxPlugin from "~/ecs/plugins/bounding-box";
import ClickablePlugin from "~/ecs/plugins/clickable";
import ColorationPlugin from "~/ecs/plugins/coloration";
import ConversationPlugin from "~/ecs/plugins/conversation";
import Css3DPlugin from "~/ecs/plugins/css3d";
import DiamondPlugin from "~/ecs/plugins/diamond";
import DistancePlugin from "~/ecs/plugins/distance";
import FirePlugin from "~/ecs/plugins/fire";
import FollowPlugin from "~/ecs/plugins/follow";
import FormPlugin from "~/ecs/plugins/form";
import Html2dPlugin from "~/ecs/plugins/html2d";
import ImagePlugin from "~/ecs/plugins/image";
import InteractorPlugin from "~/ecs/plugins/interactor";
import ItemPlugin from "~/ecs/plugins/item";
import LightingPlugin from "~/ecs/plugins/lighting";
import LineHelperPlugin from "~/ecs/plugins/line-helper";
import LookAtPlugin from "~/ecs/plugins/look-at";
import ModelPlugin from "~/ecs/plugins/model";
import MorphPlugin from "~/ecs/plugins/morph";
import NonInteractivePlugin from "~/ecs/plugins/non-interactive";
import OutlinePlugin from "~/ecs/plugins/outline";
import ParticlesPlugin from "~/ecs/plugins/particles";
import PlayerControlPlugin from "~/ecs/plugins/player-control";
import PointerPositionPlugin from "~/ecs/plugins/pointer-position";
import PortalPlugin from "~/ecs/plugins/portal";
import PhysicsPlugin from "~/ecs/plugins/physics";
import SkyboxPlugin from "~/ecs/plugins/skybox";
import SpatialIndexPlugin from "~/ecs/plugins/spatial-index";
import TransitionPlugin from "~/ecs/plugins/transition";
import TranslucentPlugin from "~/ecs/plugins/translucent";

import { PerformanceStatsSystem } from "~/ecs/systems/PerformanceStatsSystem";
import { Dispatch } from "../ProgramTypes";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

export const createECSWorld = (rapier) => (dispatch: Dispatch) => {
  const ecsWorld = new World({
    getTime: performance.now.bind(performance),
    plugins: [
      CorePlugin({
        renderer: createRenderer(),
        scene: createScene(),
        camera: new PerspectiveCamera(35, 1, 0.1, 200),
      }),
      PhysicsPlugin({
        // Pass the physics engine in to the plugin
        rapier,
      }),
      ShapePlugin,
      WallPlugin,
      FirePlugin,
      PerspectivePlugin,
      /* others */
      AnimationPlugin,
      AssetPlugin,
      BloomPlugin,
      BoneAttachPlugin,
      BoneTwistPlugin,
      BoundingBoxPlugin,
      ClickablePlugin,
      ColorationPlugin,
      ConversationPlugin,
      Css3DPlugin,
      DiamondPlugin,
      DistancePlugin,
      FollowPlugin,
      FormPlugin,
      Html2dPlugin,
      ImagePlugin,
      InteractorPlugin,
      ItemPlugin,
      LightingPlugin,
      LineHelperPlugin,
      LookAtPlugin,
      ModelPlugin,
      MorphPlugin,
      NonInteractivePlugin,
      OutlinePlugin,
      ParticlesPlugin,
      PlayerControlPlugin,
      PointerPositionPlugin,
      PortalPlugin,
      SkyboxPlugin,
      SpatialIndexPlugin,
      TransitionPlugin,
      TranslucentPlugin,
    ],
    systems: [PerformanceStatsSystem],
  }) as DecoratedECSWorld;

  const interval = setInterval(() => {
    ecsWorld.update(40);
  }, 40);
  const unsub = () => clearInterval(interval);

  dispatch({ id: "createdECSWorld", ecsWorld, ecsWorldLoaderUnsub: unsub });
};
