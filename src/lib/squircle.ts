import { getSvgPath } from "figma-squircle";

export interface SquircleOptions {
  /** Width/height of the square, in px. */
  size: number;
  /** Corner radius as a ratio of `size` (0–0.5). */
  radiusRatio: number;
  /** Figma corner smoothing (0–1). 0 = plain rounded rect. */
  smoothing: number;
}

/** SVG path string for a square squircle. Shared by preview mask and canvas export. */
export function getSquirclePath({ size, radiusRatio, smoothing }: SquircleOptions): string {
  return getSvgPath({
    width: size,
    height: size,
    cornerRadius: radiusRatio * size,
    cornerSmoothing: smoothing,
    preserveSmoothing: true,
  });
}
