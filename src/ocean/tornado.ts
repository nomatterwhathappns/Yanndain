import type { Vector3 } from 'three';

// A closed helical route rises through the cone and returns along its outside.
// No modulo/reset of height: fish turn smoothly at the top and bottom.
export function sampleTornado(
  index: number, seed: number, time: number,
  halfHeight: number, aspect: number, narrow: boolean, centerY: number,
  out: Vector3,
) {
  const cycle = seed * Math.PI * 2 + time * .17;
  const height = (1 - Math.cos(cycle)) * .5;
  const returning = Math.max(0, -Math.sin(cycle));
  const angle = index * 2.399963 + time * .62 + height * Math.PI * 3;
  const halfWidth = halfHeight * aspect;
  const radius = (.12 + height * .73 + returning * .12) * (narrow ? .7 : .29) * halfWidth;
  const ripple = 1 + .08 * Math.sin(index * 1.7 + time * .4);
  out.set(
    (narrow ? 0 : -.48 * halfWidth) + Math.cos(angle) * radius * ripple,
    centerY * halfHeight + (height - .5) * halfHeight * (narrow ? .5 : 1.2),
    -18 + Math.sin(angle) * radius * .8,
  );
  return out;
}
