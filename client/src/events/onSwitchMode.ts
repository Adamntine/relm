import { get } from "svelte/store";
import { worldManager } from "~/world";
import { worldUIMode } from "~/stores/worldUIMode";

export function onSwitchMode(switchTo) {
  if (!switchTo) {
    const $mode = get(worldUIMode);
    if ($mode === "play") switchTo = "build";
    else if ($mode === "build") switchTo = "play";
  }

  if (switchTo === "play") {
    worldUIMode.set("play");
    worldManager.selection.clear();
    worldManager.avatar.enablePhysics(true);
    worldManager.avatar.enableTranslucency(false);
  } else if (switchTo === "build") {
    worldUIMode.set("build");
    worldManager.avatar.enablePhysics(false);
    worldManager.avatar.enableTranslucency(true);
  } else {
    throw new Error(`Unknown mode to switch to: ${switchTo}`);
  }
}
