export interface WaterImpulse { x: number; y: number; time: number }
export interface WaterPointer { x: number; y: number; strength: number; speed: number }

/** Screen-space response in camera-plane units. A spiral never gains vertical drift. */
export function sampleWaterResponse(
  x: number, y: number, aspect: number, time: number,
  pointer: WaterPointer, impulses: readonly WaterImpulse[],
  upwardSpiral: boolean, out: { x: number; y: number },
) {
  out.x = 0; out.y = 0;
  const radius = .24 + pointer.speed * .13;
  const dx = (x - pointer.x) * aspect, dy = y + pointer.y;
  const distance = Math.hypot(dx, dy);
  if (distance < radius && pointer.strength > .001) {
    const weight = Math.pow(1 - distance / radius, 2) * pointer.strength * (1.1 + pointer.speed * .7);
    const length = Math.max(.03, distance);
    out.x += dx / length * weight;
    out.y += dy / length * weight;
  }
  for (const impulse of impulses) {
    const age = time - impulse.time;
    if (age < 0 || age > 3) continue;
    const px = (x - impulse.x) * aspect, py = y + impulse.y;
    const length = Math.hypot(px, py);
    const wave = Math.exp(-Math.pow((length - age * .55) / .16, 2)) * Math.exp(-age * 1.2) * 1.5;
    out.x += px / Math.max(.03, length) * wave;
    out.y += py / Math.max(.03, length) * wave;
  }
  if (upwardSpiral) out.y = 0;
  const length = Math.hypot(out.x, out.y);
  if (length > 1.5) { out.x *= 1.5 / length; out.y *= 1.5 / length; }
  return out;
}
