import { derived, Readable } from "svelte/store";

import { rapier } from "./rapier";
import { World } from "~/ecs/base";

import { createECSWorld } from "../world/createECSWorld";

export const world: Readable<World> = derived(
  rapier,
  ($rapier, set) => {
    console.log("$rapier", $rapier);
    if ($rapier) set(createECSWorld($rapier));
  },
  null
);
