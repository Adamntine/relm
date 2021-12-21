import {
  Mesh,
  MeshStandardMaterial,
  Geometry,
  SphereGeometry,
  Color,
} from "three";
import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { Presentation, Object3D } from "~/ecs/plugins/core";
import { Diamond, DiamondRef } from "../components";
import { GlowShader } from "../GlowShader";

const PI_THIRDS = Math.PI / 3.0;

export class DiamondSystem extends System {
  diamondGeometry: Geometry;
  loaded: boolean = false;

  order = Groups.Simulation + 1;

  presentation: Presentation;

  static queries = {
    new: [Diamond, Object3D, Not(DiamondRef)],
    modified: [Modified(Diamond), DiamondRef],
    active: [Diamond, DiamondRef],
    removed: [Not(Diamond), DiamondRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.presentation.loadGltf("/diamond.glb").then((mesh: any) => {
      this.diamondGeometry = mesh.scene.getObjectByName("Diamond").geometry;
      this.loaded = true;
    });
  }

  update(delta) {
    if (!this.loaded) return;

    // Rotate diamonds in step with actual time
    const d = 1 / (1000 / delta);

    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Diamond);
      const ref = entity.get(DiamondRef);
      ref.time += spec.speed * Math.PI * d;
      this.setKernelScale(ref.diamond.scale, ref.time);
      this.setDiamondRotation(ref.glow.rotation, ref.time);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  async build(entity: Entity) {
    const spec = entity.get(Diamond);
    const object3d = entity.get(Object3D).value;

    const diamond = this.createKernel(new Color(spec.color));
    if (spec.offset) diamond.position.copy(spec.offset);
    object3d.add(diamond);

    const glow = this.createDiamond();
    if (spec.offset) glow.position.copy(spec.offset);
    object3d.add(glow);

    entity.add(DiamondRef, { diamond, glow });
  }

  remove(entity: Entity) {
    const ref = entity.get(DiamondRef);

    if (ref.diamond) ref.diamond.removeFromParent();
    if (ref.glow) ref.glow.removeFromParent();

    entity.remove(DiamondRef);
  }

  // The small orange "kernel" at the interior of the diamond
  createKernel(color) {
    const material = new MeshStandardMaterial({
      color,
      transparent: true,
    });

    const diamond = new Mesh(this.diamondGeometry, material);
    this.setKernelScale(diamond.scale, 0);
    diamond.rotation.z = Math.PI / 2;
    diamond.rotation.x = Math.PI / 8;

    return diamond;
  }

  setKernelScale(scale, time) {
    scale.x = (10.0 + Math.sin(time + PI_THIRDS * 0) * 3.0) / 200;
    scale.y = (12.0 + Math.sin(time + PI_THIRDS * 1) * 3.0) / 200;
    scale.z = (14.0 + Math.sin(time + PI_THIRDS * 2) * 3.0) / 200;
  }

  // The translucent outer diamond shell
  createDiamond() {
    const geometry = new SphereGeometry(1 / 60, 0, 0);

    const glow = new Mesh(geometry, GlowShader);
    this.setDiamondRotation(glow.rotation, 0);
    glow.scale.set(8, 24, 8);

    return glow;
  }

  setDiamondRotation(rotation, time) {
    rotation.y = time / 2.0;
  }
}
