export type ShadowMapConfig = "BASIC" | "PCF" | "VSM";
export const shadowMapConfig: ShadowMapConfig = "PCF";

export const DEFAULT_RELM_ID = "default";
export const DEFAULT_ENTRYWAY = "default";
export const DEFAULT_DIRECTIONAL_LIGHT_POSITION = [-20, 20, 8];
export const DRAG_DISTANCE_THRESHOLD = 4;

// 0 - 100, where 100 is completely zoomed out
export const DEFAULT_VIEWPORT_ZOOM = 25.0;

// Height of the avatar (GLB); TODO: make this a variable?
export const AVATAR_HEIGHT = 1.5;

// Distance from camera to object of focus (e.g. web page)
export const CAMERA_FOCUS_DISTANCE = 5.0;

// How quickly to move the camera as it follows the participant
export const CAMERA_LERP_ALPHA = 0.125;
