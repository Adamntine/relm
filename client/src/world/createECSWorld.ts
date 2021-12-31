import { PerspectiveCamera } from "three";

import { World } from "~/ecs/base";

import { createRenderer } from "./createRenderer";
import { createScene } from "./createScene";

import CorePlugin from "~/ecs/plugins/core";
import ShapePlugin from "~/ecs/plugins/shape";
import WallPlugin from "~/ecs/plugins/wall";
import PerspectivePlugin from "~/ecs/plugins/perspective";

import AnimationPlugin from "~/ecs/plugins/animation";
import AssetPlugin from "~/ecs/plugins/asset";
import BoundingHelperPlugin from "~/ecs/plugins/bounding-helper";
import ClickablePlugin from "~/ecs/plugins/clickable";
import ColorationPlugin from "~/ecs/plugins/coloration";
import Css3DPlugin from "~/ecs/plugins/css3d";
import DiamondPlugin from "~/ecs/plugins/diamond";
import DistancePlugin from "~/ecs/plugins/distance";
import FirePlugin from "~/ecs/plugins/fire";
import FollowPlugin from "~/ecs/plugins/follow";
import Html2dPlugin from "~/ecs/plugins/html2d";
import ImagePlugin from "~/ecs/plugins/image";
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
import TransformEffectsPlugin from "~/ecs/plugins/transform-effects";
import TranslucentPlugin from "~/ecs/plugins/translucent";
import TwistBonePlugin from "~/ecs/plugins/twist-bone";

import { PerformanceStatsSystem } from "~/ecs/systems/PerformanceStatsSystem";

export function createECSWorld(rapier) {
  const world = new World({
    getTime: performance.now.bind(performance),
    plugins: [
      CorePlugin({
        renderer: createRenderer(),
        scene: createScene(),
        camera: new PerspectiveCamera(35, 1, 0.1, 1000),
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
      BoundingHelperPlugin,
      ClickablePlugin,
      ColorationPlugin,
      Css3DPlugin,
      DiamondPlugin,
      DistancePlugin,
      FollowPlugin,
      Html2dPlugin,
      ImagePlugin,
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
      TransformEffectsPlugin,
      TranslucentPlugin,
      TwistBonePlugin,
    ],
    systems: [PerformanceStatsSystem],
  });
  return world;
}