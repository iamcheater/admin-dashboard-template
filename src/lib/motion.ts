import { REDUCED_MOTION_QUERY } from "./constants";

export const prefersReducedMotion = (): boolean =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches;
