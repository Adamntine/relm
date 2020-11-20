import { System, Groups, Not, Modified } from "hecs";
import { Transform, WorldTransform, Vector3 } from "hecs-plugin-core";
import {
  FixedJoint,
  FixedJointRef,
  FixedJointBroke,
  RigidBodyRef,
} from "../components";

export class JointSystem extends System {
  order = Groups.Initialization;

  static queries = {
    new: [WorldTransform, RigidBodyRef, FixedJoint, Not(FixedJointRef)],
    removedWorld: [Not(WorldTransform), FixedJointRef],
    removedBody: [Not(RigidBodyRef), FixedJointRef],
    removed: [Not(FixedJoint), FixedJointRef],
    modified: [Modified(FixedJoint), FixedJointRef],
    broken: [FixedJointBroke],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.removedWorld.forEach((entity) => {
      this.release(entity);
    });
    this.queries.removedBody.forEach((entity) => {
      this.release(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.release(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.build(entity);
    });
    this.queries.broken.forEach((entity) => {
      const joint = entity.get(FixedJointRef).value;
      // joint.release();
      entity.remove(FixedJoint);
      entity.remove(FixedJointRef);
      entity.remove(FixedJointBroke);
    });
  }

  release(entity) {
    const joint = entity.get(FixedJointRef).value;
    // joint.release();
    entity.remove(FixedJointRef);
  }

  build(entity) {
    const { world, rapier } = this.world.physics;
    const spec = entity.get(FixedJoint);

    const entityBody = entity.get(RigidBodyRef).value;
    // const entityWorld = entity.get(WorldTransform);

    if (spec.entity) {
      const targetEntity = this.world.entities.getById(spec.entity);
      if (!targetEntity) {
        return console.log(
          `JointSystem: ${entity.name} targets unknown entity`
        );
      }
      const targetBody = targetEntity.get(RigidBodyRef)?.value;
      if (!targetBody) {
        return console.log(
          `JointSystem: ${entity.name} targets ${targetEntity.name} but it has no RigidBodyRef`
        );
      }

      const parentPosition = targetEntity.get(WorldTransform).position;
      const childPosition = entity.get(WorldTransform).position;
      // let jointParams = new rapier.JointParams.revolute(
      //   new Vector3(childPosition.x < 0 ? -0.5 : 0.5, 0.5, 0),
      //   new Vector3(0, 0, 1),
      //   childPosition,
      //   new Vector3(0, 0, 1),
      // );
      let jointParams = new rapier.JointParams.ball(
        new Vector3(childPosition.x < 0 ? -0.5 : 0.5, 0.5, 0),
        childPosition
      );

      const joint = world.createJoint(jointParams, targetBody, entityBody);

      const existing = entity.get(FixedJointRef);
      if (existing) {
        existing.joint.release();
        existing.joint = joint;
        existing.modified();
      } else {
        entity.add(FixedJointRef, { value: joint });
      }
    } else {
      throw new Error("joint must specify entity");
    }
  }
}
