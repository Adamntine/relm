import { get } from "svelte/store";

import { worldUIMode } from "~/stores/worldUIMode";

import { ItemActorSystem } from "~/ecs/plugins/item/systems";
import { Clickable, Clicked } from "~/ecs/plugins/clickable";

export function onAction() {
  if (get(worldUIMode) === "play") {
    const selected = ItemActorSystem.selected;
    if (selected && selected.get(Clickable) && !selected.get(Clicked)) {
      selected.add(Clicked);
    }
  }
}
