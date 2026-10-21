import type { Vector3 } from 'three';

export const TORNADO_COUNT = 420;
export function tornadoTravel(index: number, time: number) {
  return index / TORNADO_COUNT + time * .045;
}
export function tornadoHeight(progress: number) {
  // Equal population per cone surface area keeps the narrow base from crowding.
  return (Math.sqrt(.0625 + .84 * progress) - .25) / .7;
}
export function tornadoVisibility(index: number, time: number) {
  const height = tornadoTravel(index, time) % 1;
  const edge = Math.max(0, Math.min(1, (Math.min(height, 1 - height) - .025) / .055));
  return edge * edge * (3 - 2 * edge);
}

// Surface-area spacing and five helical streams, all moving upward.
// Fish recycle only while hidden at the ends; there is no descending return path.
export function sampleTornado(
  index: number, seed: number, time: number,
  halfHeight: number, aspect: number, narrow: boolean, centerY: number,
  out: Vector3,
) {
  const height = tornadoHeight(tornadoTravel(index, time) % 1);
  const angle = (index % 5) * Math.PI * 2 / 5 + time * .9 + height * Math.PI * 4 + seed * .45;
  const halfWidth = halfHeight * aspect;
  const radius = (.25 + height * .7) * (narrow ? .7 : .29) * halfWidth;
  const ripple = 1 + .08 * Math.sin(index * 1.7 + time * .4);
  out.set(
    (narrow ? 0 : -.48 * halfWidth) + Math.cos(angle) * radius * ripple,
    centerY * halfHeight + (height - .5) * halfHeight * (narrow ? .5 : 1.2),
    -18 + Math.sin(angle) * radius * .8,
  );
  return out;
}
