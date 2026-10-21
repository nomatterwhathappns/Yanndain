import * as THREE from 'three';

type Point = [number, number, number];
class MeshBuilder {
  positions: number[] = [];
  colors: number[] = [];
  indices: number[] = [];
  vertex(point: Point, color: THREE.Color) {
    const index = this.positions.length / 3;
    this.positions.push(...point);
    this.colors.push(color.r, color.g, color.b);
    return index;
  }
  triangle(a: Point, b: Point, c: Point, color: THREE.Color) {
    const first = this.vertex(a, color);
    this.vertex(b, color);
    this.vertex(c, color);
    this.indices.push(first, first + 1, first + 2);
  }
  append(geometry: THREE.BufferGeometry, color: THREE.Color) {
    const positions = geometry.getAttribute('position');
    const start = this.positions.length / 3;
    for (let i = 0; i < positions.count; i++) this.vertex([positions.getX(i), positions.getY(i), positions.getZ(i)], color);
    const index = geometry.getIndex()!;
    for (let i = 0; i < index.count; i++) this.indices.push(index.getX(i) + start);
    geometry.dispose();
  }
  sphere(center: Point, radius: number, color: THREE.Color) {
    this.append(new THREE.SphereGeometry(radius, 8, 6).translate(...center), color);
  }
  tube(points: Point[], radius: number, color: THREE.Color) {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    this.append(new THREE.TubeGeometry(curve, 18, radius, 6, false), color);
  }
  build() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
    geometry.setIndex(this.indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }
}
export type FishSpecies = 'sardine' | 'jack' | 'reef' | 'lantern' | 'manta' | 'large';

export function makeFishGeometry(species: Exclude<FishSpecies, 'manta'>, lightweight: boolean) {
  if (species === 'large') return makeSharkGeometry(lightweight);
  const mesh = new MeshBuilder();
  const ringCount = lightweight ? 14 : 20;
  const radialCount = lightweight ? 10 : 14;
  const thick = species === 'jack' ? 1.55 : species === 'reef' ? 2.05 : 1;
  const wide = species === 'jack' ? 1.25 : species === 'reef' ? 1.4 : 1;
  const bodyRadiusY = .145 * thick;
  const bodyRadiusZ = .12 * wide;
  const profileAt = (t: number) => Math.pow(Math.sin(t * Math.PI), .72) * (.8 + .2 * (1 - t)) + .025;
  // Keep eyes, fins and light organs on the fuller curved body surface.
  const surfaceZ = (x: number, y: number) => {
    const profile = profileAt(THREE.MathUtils.clamp(.55 - x, 0, 1));
    const vertical = y / (bodyRadiusY * profile);
    return bodyRadiusZ * profile * Math.sqrt(Math.max(0, 1 - vertical * vertical));
  };
  const top = new THREE.Color(species === 'reef' ? '#4d6d67' : '#355f72');
  const side = new THREE.Color(species === 'reef' ? '#9eaa83' : species === 'lantern' ? '#667f93' : '#9eafb4');
  const belly = new THREE.Color('#d3d6c8');
  const fin = new THREE.Color(species === 'reef' ? '#8f9e76' : '#688a92');
  const dark = new THREE.Color('#08151b');
  for (let i = 0; i <= ringCount; i++) {
    const t = i / ringCount;
    const x = .55 - t;
    const profile = profileAt(t);
    for (let j = 0; j <= radialCount; j++) {
      const angle = j / radialCount * Math.PI * 2;
      const y = Math.cos(angle) * bodyRadiusY * profile;
      const z = Math.sin(angle) * bodyRadiusZ * profile;
      const vertical = Math.cos(angle);
      const color = side.clone();
      if (vertical > .15) color.lerp(top, Math.pow((vertical - .15) / .85, .65));
      else color.lerp(belly, Math.max(0, -vertical) * .8);
      if (species === 'reef') {
        const stripe = Math.pow(.5 + .5 * Math.cos(t * Math.PI * 10), 8);
        color.multiplyScalar(1 - stripe * .38);
      }
      if (t > .16 && t < .21) color.multiplyScalar(.6); // Gill plate.
      mesh.vertex([x, y, z], color);
      if (i < ringCount && j < radialCount) {
        const index = i * (radialCount + 1) + j;
        mesh.indices.push(index, index + radialCount + 1, index + 1, index + 1, index + radialCount + 1, index + radialCount + 2);
      }
    }
  }
  const tail = species === 'reef' ? .2 : .21;
  mesh.triangle([-.43, .03, 0], [-.82, tail, 0], [-.68, .015, 0], fin);
  mesh.triangle([-.43, -.03, 0], [-.68, -.015, 0], [-.82, -tail, 0], fin);
  mesh.triangle([-.43, -.03, 0], [-.43, .03, 0], [-.68, .015, 0], fin);
  mesh.triangle([.12, .13 * thick, 0], [-.1, .23 * thick, 0], [-.3, .09 * thick, 0], fin);
  mesh.triangle([-.12, -.11 * thick, 0], [-.3, -.23 * thick, 0], [-.37, -.055 * thick, 0], fin);
  for (const sign of [-1, 1]) {
    mesh.triangle([.22, -.025, sign * surfaceZ(.22, -.025) * .98], [-.12, -.15, sign * .26 * wide], [-.02, -.07, sign * surfaceZ(-.02, -.07) * .98], fin);
    const eyeY = .043 * thick;
    const eyeZ = surfaceZ(.375, eyeY);
    mesh.sphere([.375, eyeY, sign * (eyeZ - .004)], .021, side);
    mesh.sphere([.375, eyeY, sign * (eyeZ + .012)], .014, dark);
    if (species === 'lantern') {
      for (let i = 0; i < 5; i++) {
        const x = .18 - i * .09;
        mesh.sphere([x, -.08, sign * (surfaceZ(x, -.08) + .003)], .012, new THREE.Color('#9be6ce'));
      }
    }
  }
  const geometry = mesh.build();
  // The two ends of each radial ring occupy the same point. Share their normal
  // so the back catches light as a rounded surface instead of a folded edge.
  const normals = geometry.getAttribute('normal');
  const normal = new THREE.Vector3();
  for (let i = 0; i <= ringCount; i++) {
    const a = i * (radialCount + 1), b = a + radialCount;
    normal.set(normals.getX(a) + normals.getX(b), normals.getY(a) + normals.getY(b), normals.getZ(a) + normals.getZ(b)).normalize();
    normals.setXYZ(a, normal.x, normal.y, normal.z);
    normals.setXYZ(b, normal.x, normal.y, normal.z);
  }
  return geometry;
}

// Reef shark proportions: long rounded body, separate pectoral fins, two dorsal
// fins and an asymmetric caudal fin. It does not share the small-fish silhouette.
export function makeSharkGeometry(lightweight: boolean) {
  const mesh = new MeshBuilder();
  const rings = lightweight ? 28 : 44, sides = lightweight ? 12 : 18;
  const dorsal = new THREE.Color('#466874'), flank = new THREE.Color('#849e9f');
  const belly = new THREE.Color('#c7d0c3'), fin = new THREE.Color('#577b84');
  const dark = new THREE.Color('#162b33');
  const profile = [[0, .008], [.1, .11], [.24, .24], [.43, .29], [.6, .24], [.79, .13], [.94, .045], [1, .037]];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const k = Math.min(profile.length - 2, profile.findIndex((point, j) => j < profile.length - 1 && t <= profile[j + 1][0]));
    const a = profile[k], b = profile[k + 1];
    const r = THREE.MathUtils.lerp(a[1], b[1], THREE.MathUtils.smoothstep(t, a[0], b[0]));
    for (let j = 0; j <= sides; j++) {
      const angle = j / sides * Math.PI * 2, vertical = Math.cos(angle);
      const color = flank.clone().lerp(vertical > 0 ? dorsal : belly, Math.abs(vertical));
      mesh.vertex([1.12 - t * 2.52, vertical * r, Math.sin(angle) * r * 1.02], color);
      if (i < rings && j < sides) {
        const p = i * (sides + 1) + j;
        mesh.indices.push(p, p + sides + 1, p + 1, p + 1, p + sides + 1, p + sides + 2);
      }
    }
  }
  mesh.triangle([.18, .27, 0], [-.21, .88, 0], [-.56, .21, 0], dorsal);
  mesh.triangle([-.84, .12, 0], [-1.02, .32, 0], [-1.17, .075, 0], dorsal);
  for (const s of [-1, 1]) {
    mesh.triangle([.35, -.07, s * .23], [-.48, -.29, s * 1.02], [-.45, -.13, s * .23], fin);
    mesh.triangle([-.62, -.11, s * .11], [-.98, -.23, s * .38], [-.93, -.07, s * .08], fin);
    mesh.sphere([.79, .065, s * .145], .029, dark);
    // Five gill slits and a small underslung mouth stay attached to the body.
    for (let g = 0; g < 5; g++) {
      const x = .38 - g * .065;
      mesh.triangle([x, .105, s * .255], [x - .025, -.12, s * .257], [x - .037, .09, s * .265], dark);
    }
    mesh.tube([[.97, -.065, s * .07], [.81, -.115, s * .13], [.67, -.14, s * .13]], .009, dark);
  }
  const tail: Point[] = [[-1.39, .035, 0], [-1.69, .36, 0], [-2.04, .78, 0], [-1.91, .28, 0], [-1.77, .01, 0], [-1.97, -.43, 0], [-1.71, -.28, 0], [-1.39, -.035, 0]];
  for (let i = 1; i < tail.length - 1; i++) mesh.triangle(tail[0], tail[i], tail[i + 1], fin);
  return mesh.build();
}

export function makeMantaGeometry(lightweight: boolean) {
  const mesh = new MeshBuilder();
  const span = lightweight ? 30 : 44;
  const chord = lightweight ? 14 : 20;
  const dorsal = new THREE.Color('#263f4a');
  const shoulder = new THREE.Color('#76918e');
  const ventral = new THREE.Color('#c7d2c8');
  for (const surface of [1, -1]) {
    const offset = mesh.positions.length / 3;
    for (let i = 0; i <= span; i++) {
      const u = i / span * 2 - 1;
      const wing = Math.abs(u);
      const leading = .76 - 1.08 * Math.pow(wing, 1.25);
      const trailing = -.88 + .54 * Math.pow(wing, .65);
      for (let j = 0; j <= chord; j++) {
        const v = j / chord;
        const x = THREE.MathUtils.lerp(leading, trailing, v);
        const y = surface * .15 * Math.pow(1 - wing, 1.3) * Math.sin(v * Math.PI);
        const z = u * 2.15;
        const patch = Math.exp(-Math.pow((wing - .2) * 6, 2) - Math.pow((v - .25) * 7, 2));
        const color = surface > 0 ? dorsal.clone().lerp(shoulder, patch * .6) : ventral.clone().multiplyScalar(.86 + wing * .14);
        mesh.vertex([x, y, z], color);
        if (i < span && j < chord) {
          const p = offset + i * (chord + 1) + j;
          if (surface > 0) mesh.indices.push(p, p + 1, p + chord + 1, p + 1, p + chord + 2, p + chord + 1);
          else mesh.indices.push(p, p + chord + 1, p + 1, p + 1, p + chord + 1, p + chord + 2);
        }
      }
    }
  }
  const tailColor = new THREE.Color('#263d45');
  mesh.tube([[-.72, .025, 0], [-1.15, .025, .015], [-1.8, .035, .05], [-2.5, .02, .035]], .018, tailColor);
  for (const sign of [-1, 1]) {
    mesh.tube([[.53, .015, sign * .29], [.78, -.015, sign * .3], [.94, .015, sign * .26], [.96, .065, sign * .23]], .038, dorsal);
    mesh.sphere([.59, .065, sign * .32], .034, new THREE.Color('#071b23'));
  }
  mesh.tube([[.74, -.015, -.21], [.77, -.045, 0], [.74, -.015, .21]], .018, new THREE.Color('#142e36'));
  return mesh.build();
}
