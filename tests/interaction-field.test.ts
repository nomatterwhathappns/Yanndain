import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleWaterResponse } from '../src/ocean/interaction-field.ts';

test('water response yields around the pointer, strengthens with speed, then releases', () => {
  const point = { x: .1, y: -.04 };
  const slow = sampleWaterResponse(point.x, point.y, 1, 0, { x: 0, y: 0, strength: 1, speed: 0 }, [], false, { x: 0, y: 0 });
  const fast = sampleWaterResponse(point.x, point.y, 1, 0, { x: 0, y: 0, strength: 1, speed: 1 }, [], false, { x: 0, y: 0 });
  assert(slow.x > 0 && slow.y < 0);
  assert(Math.hypot(fast.x, fast.y) > Math.hypot(slow.x, slow.y));
  assert.deepEqual(sampleWaterResponse(point.x, point.y, 1, 0, { x: 0, y: 0, strength: 0, speed: 0 }, [], false, { x: 1, y: 1 }), { x: 0, y: 0 });
});

test('tap waves travel outward, expire, remain bounded, and never pull tornado fish downward', () => {
  const idle = { x: 0, y: 0, strength: 0, speed: 0 };
  const waves = [{ x: 0, y: 0, time: 0 }];
  const before = sampleWaterResponse(.55, 0, 1, 0, idle, waves, false, { x: 0, y: 0 }).x;
  const arrival = sampleWaterResponse(.55, 0, 1, 1, idle, waves, false, { x: 0, y: 0 }).x;
  assert(arrival > before * 10);
  assert.deepEqual(sampleWaterResponse(.55, 0, 1, 4, idle, waves, false, { x: 0, y: 0 }), { x: 0, y: 0 });
  for (const aspect of [.46, 1.44, 2.4]) for (const time of [0, .2, .8, 2, 4]) for (const y of [-.4, -.1, 0, .1, .4]) {
    const result = sampleWaterResponse(.05, y, aspect, time, { ...idle, strength: 1, speed: 1 }, [...waves, ...waves, ...waves], true, { x: 0, y: 0 });
    assert.equal(result.y, 0);
    assert(Number.isFinite(result.x));
    assert(Math.hypot(result.x, result.y) <= 1.500001);
  }
});
