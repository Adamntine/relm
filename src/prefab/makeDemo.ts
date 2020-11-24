import { Asset, Transform, Vector3, Quaternion } from "hecs-plugin-core";
import { Model, Camera, LookAt } from "hecs-plugin-three";
import { Euler } from "three";

import { NormalizeMesh } from "~/ecs/plugins/normalize";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";
import { TransformEffects } from "~/ecs/plugins/transform-effects";

import {
  makeEntity,
  makeBox,
  makeBall,
  makePileOfBoxes,
  makeYoutube,
  makeThing,
} from "~/prefab";

// grass field
const fieldSize = {
  w: 150,
  h: 0.5,
  d: 150,
};

const floorSize = {
  w: 12,
  d: 8,
};

export function makeDemo(world) {
  const entities = [];

  // Create the floor
  const floor1 = makeBox(world, {
    y: -0.45,
    w: floorSize.w + 0.2,
    h: 0.5,
    d: floorSize.d + 0.2,
    color: "white",
    dynamic: false,
  }).activate();
  entities.push(floor1);

  // Westx1
  const floor2 = makeBox(world, {
    x: -floorSize.w,
    y: -3,
    w: floorSize.w + 0.2,
    h: 0.5,
    d: floorSize.d + 0.2,
    color: "white",
    dynamic: false,
  }).activate();
  entities.push(floor2);

  // Westx2
  const floor3 = makeBox(world, {
    x: -floorSize.w * 2,
    y: 1,
    w: floorSize.w + 0.2,
    h: 0.5,
    d: floorSize.d + 0.2,
    color: "white",
    dynamic: false,
  }).activate();
  entities.push(floor3);

  const lamp = makeThing(world, {
    url: "/lamp.glb",
    x: -floorSize.w * 2 - 3,
    y: 1.5,
    z: 0,
    yOffset: 1,
  }).activate();
  entities.push(lamp);

  const couch = makeThing(world, {
    url: "/couch.glb",
    x: -floorSize.w * 2,
    y: 1.5,
    z: 0,
    w: 4,
    h: 4,
    d: 4,
    yOffset: -0.2,
  }).activate();
  entities.push(couch);

  // Create the grass
  const grass = makeBox(world, {
    y: -10,
    ...fieldSize,
    color: "#44ba63",
    dynamic: false,
  }).activate();
  entities.push(grass);

  // Create "Sun"
  const sun = makeBall(world, {
    x: 10,
    y: 22,
    z: -60,
    r: 5,
    color: "#ffffdd",
    emissive: "#ffff00",
    collider: false,
  }).activate();
  entities.push(sun);

  // Create Mountains
  for (let i = 0; i < 3; i++) {
    const mountain = makeBox(world, {
      x: (i - 1) * 20,
      y: -10,
      z: -40,
      w: 20,
      h: 20,
      d: 20,
      color: "#44ba63",
      collider: false,
    }).activate();
    mountain
      .get(Transform)
      .rotation.setFromEuler(new Euler(-Math.PI / 4, 0, -Math.PI / 4));
    entities.push(mountain);
  }

  /********* WALLS **********/

  // Left Wall
  const leftWall = makeBox(world, {
    x: -floorSize.w / 2,
    y: -0.25,
    w: 0.2,
    h: 0.5,
    d: floorSize.d,
    color: "white",
    dynamic: false,
  }).activate();
  entities.push(leftWall);

  // Back Wall
  const backWall = makeBox(world, {
    ...{ x: -0.05, y: -0.25, z: -floorSize.d / 2 },
    ...{ w: floorSize.w + 0.1, h: 0.5, d: 0.2 },
    color: "white",
    dynamic: false,
  }).activate();
  entities.push(backWall);

  // Front Wall
  const frontWall = makeBox(world, {
    ...{ x: -0.05, y: -0.25, z: floorSize.d / 2 },
    ...{ w: floorSize.w + 0.1, h: 0.5, d: 0.2 },
    color: "white",
    dynamic: false,
  }).activate();
  entities.push(frontWall);

  // Ramp
  const ramp1 = makeBox(world, {
    ...{ x: 14.75, y: -5.5, z: 2 },
    ...{ w: 20, h: 0.5, d: 4 },
    color: "white",
    dynamic: false,
  }).activate();
  ramp1
    .get(Transform)
    .rotation.setFromEuler(new Euler(-Math.PI / 12, 0, -Math.PI / 6, "ZYX"));
  entities.push(ramp1);

  const ramp2 = makeBox(world, {
    ...{ x: 14.75, y: -5.5, z: -2 },
    ...{ w: 20, h: 0.5, d: 4 },
    color: "white",
    dynamic: false,
  }).activate();
  ramp2
    .get(Transform)
    .rotation.setFromEuler(new Euler(Math.PI / 12, 0, -Math.PI / 6, "ZYX"));
  entities.push(ramp2);

  /********* BOXES **********/

  // Pile of boxes
  const boxes = makePileOfBoxes(world, { count: 10 });
  entities.push(...boxes);

  // Orange Box
  const orangeBox = makeBox(world, {
    x: 4,
    y: 0,
    z: 2,
    color: "orange",
    name: "OrangeBox",
    metalness: 0.9,
    roughness: 0.2,
  }).activate();
  entities.push(orangeBox);

  // Brown Box
  const brownBox = makeBox(world, {
    x: 2.5,
    y: 0,
    z: 0,
    color: "brown",
    name: "BrownBox",
  }).activate();
  entities.push(brownBox);

  // TV Box
  const tvBox = makeBox(world, {
    ...{ x: -2.5, y: 0, z: 0, w: 3.2, h: 1.888, d: 0.6 },
    color: "gray",
    name: "BlueBox",
  }).activate();
  tvBox.get(Transform).rotation = new Quaternion().setFromEuler(
    new Euler(0, Math.PI / 4, 0)
  );
  entities.push(tvBox);

  const video = makeYoutube(world, {
    x: 0.0,
    y: 0.0,
    z: 0.301,
    embedId: "U_u91SjrEOE",
    frameWidth: 560,
    frameHeight: 315,
    worldWidth: 3,
  }).activate();
  video.setParent(tvBox);
  entities.push(video);

  /********* GAME OBJECTS *********/

  const ball = makeBall(world, {
    ...{ x: 0, y: 0.5, z: -2 },
    r: 0.5,
    color: "#ddff11",
    name: "Ball",
  }).activate();
  entities.push(ball);

  // Chair
  const chair = makeEntity(world, "Chair")
    .add(NormalizeMesh)
    .add(Transform, {
      // Put it in the corner
      position: new Vector3(5, 0, -3),
      scale: new Vector3(0.75, 0.75, 0.75),
      rotation: new Quaternion().setFromEuler(new Euler(0, -Math.PI / 4, 0)),
    })
    .add(TransformEffects, {
      effects: [
        { function: "position", params: { position: new Vector3(0, 0.35, 0) } },
      ],
    })
    .add(Model, {
      asset: new Asset("/chair.glb"),
    })
    .add(RigidBody, {
      kind: "DYNAMIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(0.8, 0.8, 0.8),
    })
    .activate();
  entities.push(chair);

  return entities;
}
