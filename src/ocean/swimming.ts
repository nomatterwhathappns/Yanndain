import { Vector3 } from 'three';
import type { FishSpecies } from './fish-models';

export interface Swimmer {
  species: FishSpecies;
  index: number;
  school: number;
  seed: number;
  offset: Vector3;
}
export interface SwimView { narrow: boolean; depth: number }

const schools = [
  [2, 2.5, -13, .5], [1, -1.8, -12, 2.9], [-1, 5, -21, 1.3],
  [2, -.4, -22, 4.7], [-2, -4, -14, 2.2], [0, 3, -29, 5.3], [2, -3, -18, 3.4],
  [-1, 6.2, -18, 5.8], [1, 3.8, -19, .8], [-2, -4.3, -13, 4.1], [2, -3.5, -18, 2.4],
];
const mobileBands = [6.8, 2.2, 10.5, -1, -5, 8, -8.4, 9, 4, -4.2, -7];

// Continuous closed routes let schools cross the view, turn in depth and return.
// Offsets along the same route keep each school together without teleporting.
// Time is in seconds and independent of scroll or the number of rendered frames.
export function sampleSwimPosition(fish: Swimmer, time: number, view: SwimView, out: Vector3) {
  const { narrow, depth } = view;
  if (fish.species === 'manta') {
    const phase = time * (fish.index === 0 ? .2 : -.16) + (fish.index === 0 ? (narrow ? .1 : .65) : 3.7);
    out.set(
      (narrow ? .2 : 3.2) + Math.sin(phase) * (narrow ? 5.3 : 8.2),
      (fish.index === 0 ? (narrow ? -2 : .5) : (narrow ? 8.5 : 4.8)) + Math.sin(phase * 2) * 1.05,
      (fish.index === 0 ? -13 : -24) + Math.cos(phase) * 6,
    );
  } else if (fish.species === 'large') {
    const phase = time * (fish.index % 2 ? -.12 : .14) + [-.35, 2.5, 4.1, 1.2][fish.index];
    out.set(
      Math.sin(phase) * (narrow ? 7.5 : 16),
      (narrow ? [7.6, -4.2, 1.9, -8.5] : [4.8, -3.5, 3, -5.8])[fish.index] + Math.sin(phase * 2) * .65,
      [-18, -24, -31, -36][fish.index] + Math.cos(phase) * 4.5,
    );
  } else {
    const school = schools[fish.school];
    const speed = fish.species === 'lantern' ? .14 : .23 + fish.school % 3 * .018;
    const phase = school[3] + time * speed + fish.offset.x * .09;
    const radiusX = (narrow ? 5.8 : 10.5) + fish.school % 3 * 1.1;
    out.set(
      school[0] * (narrow ? .3 : 1) + Math.sin(phase) * radiusX + fish.offset.z * .12,
      (narrow ? mobileBands[fish.school] : school[1]) + fish.offset.y * (narrow ? 1.2 : 1) + Math.sin(phase * 2) * .75,
      school[2] + Math.cos(phase) * 3.8 + fish.offset.z * .65,
    );
    if (fish.species === 'lantern') {
      out.z += -8 + depth * 17;
      out.y *= .8;
    }
  }
  out.y -= depth * 4;
  return out;
}
