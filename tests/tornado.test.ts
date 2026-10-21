import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { sampleTornado, tornadoTravel, tornadoHeight, tornadoVisibility, TORNADO_COUNT } from '../src/ocean/tornado.ts';

test('every visible tornado fish rises and density follows cone surface area', () => {
  for (const time of [0, 5, 17, 29, 100]) {
    const bands = Array(10).fill(0);
    for (let i = 0; i < TORNADO_COUNT; i++) {
      const phase = tornadoHeight(tornadoTravel(i, time) % 1);
      bands[Math.floor(phase * 10)]++;
      if (Math.floor(tornadoTravel(i, time)) !== Math.floor(tornadoTravel(i, time + .04))) continue;
      for (const narrow of [false, true]) {
        const a = sampleTornado(i, .37, time, 8, narrow ? .46 : 1.44, narrow, 0, new Vector3());
        const b = sampleTornado(i, .37, time + .04, 8, narrow ? .46 : 1.44, narrow, 0, new Vector3());
        assert(b.y > a.y, `fish ${i} must rise`);
        assert(Number.isFinite(b.length()));
      }
    }
    for (let band = 0; band < 10; band++) {
      const low = band / 10, high = (band + 1) / 10;
      const expected = TORNADO_COUNT * (.25 * (high - low) + .35 * (high * high - low * low)) / .6;
      assert(Math.abs(bands[band] - expected) <= 2, `crowding in height band ${band}`);
    }
  }
});

test('recycling at the top and bottom happens while fully hidden', () => {
  for (let i = 0; i < TORNADO_COUNT; i++) {
    const reset = (1 - i / TORNADO_COUNT) / .045;
    assert.equal(tornadoVisibility(i, reset - .04), 0);
    assert.equal(tornadoVisibility(i, reset + .04), 0);
  }
});
