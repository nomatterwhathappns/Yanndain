import * as THREE from 'three';
import { makeFishGeometry, makeMantaGeometry, type FishSpecies } from './fish-models';
import { sampleSwimPosition } from './swimming';
import { sampleTornado } from './tornado';

export const FISH_COUNTS = Object.freeze({ sardine: 700, jack: 120, reef: 50, lantern: 24, manta: 2, large: 4 });
export const FISH_TOTAL = Object.values(FISH_COUNTS).reduce((sum, value) => sum + value, 0);
export interface OceanState {
  depth: number;
  tornado: number; tornadoY: number;
  vortex: number; vortexPhase: number; vortexY: number;
  corridor: number; corridorPhase: number; corridorY: number;
  reading: boolean;
}
export interface OceanControls {
  setState(state: OceanState): void;
  setPointer(x: number, y: number): void;
  setReducedMotion(value: boolean): void;
  dispose(): void;
}
type Fish = {
  species: FishSpecies; index: number; school: number; seed: number; scale: number;
  offset: THREE.Vector3; position: THREE.Vector3; heading: THREE.Quaternion;
  velocity: THREE.Vector3; initialized: boolean;
};
type Population = { species: FishSpecies; mesh: THREE.InstancedMesh; fish: Fish[] };
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const defaultState: OceanState = { depth: 0, tornado: 0, tornadoY: 0, vortex: 0, vortexPhase: 0, vortexY: 0, corridor: 0, corridorPhase: 0, corridorY: 0, reading: false };

export function mountOcean(canvas: HTMLCanvasElement): OceanControls {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  const isMobile = matchMedia('(max-width: 760px)').matches;
  let pixelRatio = Math.min(devicePixelRatio, isMobile ? 1.25 : 1.6);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
  camera.position.set(0, 0, 10);
  scene.fog = new THREE.FogExp2(0x123b4b, .024);
  const resources: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(value: T): T => { resources.push(value); return value; };
  let state = { ...defaultState };
  let smooth = { ...defaultState };
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let disposed = false;
  let frame = 0;
  let time = 0;
  let previous = performance.now();
  let pointer = new THREE.Vector2();
  let smoothPointer = new THREE.Vector2();
  let frameSamples = 0;
  let frameTime = 0;
  let narrow = isMobile;
  let contextLost = false;
  let grid = new Map<string, Fish[]>();
  const clockUniform = { value: 0 };

  const waterUniforms = {
    uTime: clockUniform, uDepth: { value: 0 }, uAspect: { value: 1 },
    uPointer: { value: new THREE.Vector2() }, uCorridor: { value: 0 },
  };
  const water = keep(new THREE.ShaderMaterial({
    uniforms: waterUniforms, depthWrite: false, depthTest: false,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,.999,1.);}`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime,uDepth,uAspect,uCorridor;
      uniform vec2 uPointer;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.28+noise(p*4.09)*.12+noise(p*8.1)*.05;}
      void main(){
        vec2 uv=vUv; float t=uTime*.08;
        float depth=uDepth;
        vec3 dark=mix(vec3(.003,.019,.035),vec3(.001,.005,.012),depth);
        vec3 light=mix(vec3(.035,.13,.18),vec3(.006,.025,.055),depth);
        float top=pow(uv.y,1.35);
        vec3 color=mix(dark,light,top);
        vec2 sun=vec2(.67+uPointer.x*.012,1.18);
        vec2 delta=uv-sun;
        float angle=atan(delta.x*uAspect,-delta.y);
        float soft=pow(.5+.5*sin(angle*15.+fbm(vec2(angle*6.,t*.3))*4.+t*.2),7.);
        float fine=pow(.5+.5*sin(angle*37.+fbm(vec2(angle*12.+2.,t*.2))*3.),16.);
        float rays=(soft*.7+fine*.25)*pow(uv.y,.65)*(1.-depth*.88);
        rays*=.6+.4*fbm(uv*5.+vec2(t*.1,-t*.3));
        color+=vec3(.06,.13,.14)*rays;
        // Light scattered from the moving water surface, not a flat neon glow.
        float ceiling=smoothstep(.72,1.,uv.y)*(1.-depth);
        float surface=fbm(vec2(uv.x*15.+t*.4,uv.y*35.+t));
        color+=vec3(.04,.08,.07)*ceiling*surface;
        float sunGlow=exp(-length((uv-vec2(.66,1.05))*vec2(1.7,1.))*3.7);
        color+=vec3(.06,.10,.08)*sunGlow*(1.-depth*.8);
        // A distant opening gives the final corridor a vanishing point.
        float horizon=exp(-length((uv-vec2(.5,.5))*vec2(4.,3.5))*3.);
        color+=vec3(.085,.17,.18)*horizon*uCorridor;
        float mist=fbm(uv*3.+vec2(t*.08,t*.04));
        color=mix(color,color+vec3(.009,.021,.023),mist*.45);
        float vignette=1.-smoothstep(.25,.85,length((uv-.5)*vec2(.95,1.)));
        color*=.73+vignette*.27;
        color+=(hash(gl_FragCoord.xy)-.5)*.0015;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const waterPlane = new THREE.Mesh(keep(new THREE.PlaneGeometry(2, 2)), water);
  waterPlane.frustumCulled = false;
  waterPlane.renderOrder = -100;
  scene.add(waterPlane);

  // Local environment texture: broad patches of sky and water, with no network
  // requests or photorealistic texture assets required by the portable preview.
  const environmentCanvas = document.createElement('canvas');
  environmentCanvas.width = 512; environmentCanvas.height = 256;
  const painter = environmentCanvas.getContext('2d')!;
  const gradient = painter.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#dce2cf'); gradient.addColorStop(.14, '#829f9c');
  gradient.addColorStop(.37, '#38616f'); gradient.addColorStop(.55, '#173746');
  gradient.addColorStop(1, '#061521');
  painter.fillStyle = gradient; painter.fillRect(0, 0, 512, 256);
  const light = painter.createRadialGradient(335, 40, 0, 335, 40, 125);
  light.addColorStop(0, '#fcf6d9'); light.addColorStop(.2, '#bccbb6');
  light.addColorStop(1, '#38566300');
  painter.fillStyle = light; painter.fillRect(0, 0, 512, 256);
  const texture = keep(new THREE.CanvasTexture(environmentCanvas));
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = keep(pmrem.fromEquirectangular(texture));
  scene.environment = env.texture;
  pmrem.dispose();
  const ambient = new THREE.HemisphereLight(0xd1e6d9, 0x0b293e, 1.35);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xe6ead9, 2.8);
  sun.position.set(2, 8, 6); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7ab8c5, 1.4);
  rim.position.set(-7, 1, -12); scene.add(rim);

  let seed = 4759;
  const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
  function fishMaterial(species: FishSpecies) {
    const material = keep(new THREE.MeshStandardMaterial({
      vertexColors: true, roughness: species === 'manta' ? .64 : species === 'large' ? .52 : .38,
      metalness: species === 'manta' || species === 'large' ? .08 : .46,
      side: THREE.DoubleSide, envMapIntensity: .95,
      emissive: species === 'lantern' ? 0x0c252e : 0x000000,
      emissiveIntensity: species === 'lantern' ? .6 : 0,
    }));
    material.onBeforeCompile = shader => {
      shader.uniforms.uSwimTime = clockUniform;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uSwimTime;\nattribute float aPhase;');
      if (species === 'manta') {
        shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>
          float wingHeight(vec3 p, float t, float phase) {
            float wing=pow(abs(p.z)/2.15,1.7);
            return sin(t*1.8+phase-abs(p.z)*.65+p.x*.4)*wing*.72;
          }`);
        shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
          float slopeX=(wingHeight(position+vec3(.01,0.,0.),uSwimTime,aPhase)-wingHeight(position-vec3(.01,0.,0.),uSwimTime,aPhase))/.02;
          float slopeZ=(wingHeight(position+vec3(0.,0.,.01),uSwimTime,aPhase)-wingHeight(position-vec3(0.,0.,.01),uSwimTime,aPhase))/.02;
          objectNormal=normalize(vec3(objectNormal.x-slopeX*objectNormal.y,objectNormal.y,objectNormal.z-slopeZ*objectNormal.y));`);
      }
      const deformation = species === 'manta' ? `
        transformed.y+=wingHeight(position,uSwimTime,aPhase);
        transformed.z+=sin(uSwimTime*1.8+aPhase)*max(0.,-position.x-.85)*.04;
      ` : species === 'large' ? `
        float tail=pow(clamp((.65-position.x)/2.7,0.,1.),1.8);
        transformed.z+=sin(uSwimTime*3.+aPhase+position.x*2.7)*tail*.24;
      ` : `
        float tail=pow(clamp((.35-position.x)/1.15,0.,1.),1.6);
        float speed=7.2;
        transformed.z+=sin(uSwimTime*speed+aPhase+position.x*5.8)*tail*.115;
        transformed.y+=sin(uSwimTime*speed*.5+aPhase)*tail*.012;
      `;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n${deformation}`);
    };
    material.customProgramCacheKey = () => `fish-${species}`;
    return material;
  }
  const populations: Population[] = [];
  const allFish: Fish[] = [];
  let globalIndex = 0;
  for (const [name, count] of Object.entries(FISH_COUNTS)) {
    const species = name as FishSpecies;
    const geometry = keep(species === 'manta' ? makeMantaGeometry(isMobile) : makeFishGeometry(species, isMobile));
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) phases[i] = random() * TAU;
    geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    const mesh = new THREE.InstancedMesh(geometry, fishMaterial(species), count);
    mesh.name = `${species}-${count}`;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);
    resources.push(mesh);
    const fish: Fish[] = [];
    for (let i = 0; i < count; i++) {
      const index = globalIndex++;
      const scale = species === 'sardine' ? .25 + random() * .2 : species === 'jack' ? .45 + random() * .35 : species === 'reef' ? .35 + random() * .25 : species === 'manta' ? 1.5 - i * .2 : species === 'large' ? 1.3 + random() * .45 : .3 + random() * .25;
      const item: Fish = {
        species, index: i, school: species === 'sardine' ? i % 7 : (index % 4) + 7,
        seed: random(), scale,
        offset: new THREE.Vector3((random() - .5) * 8, (random() - .5) * 3, (random() - .5) * 5),
        position: new THREE.Vector3(), heading: new THREE.Quaternion(),
        velocity: new THREE.Vector3(), initialized: false,
      };
      fish.push(item); allFish.push(item);
    }
    populations.push({ species, mesh, fish });
  }
  canvas.dataset.fishCount = String(populations.reduce((sum, population) => sum + population.mesh.count, 0));
  canvas.dataset.fishPopulation = JSON.stringify(Object.fromEntries(populations.map(population => [population.species, population.mesh.count])));

  // Fine suspended matter uses one draw call and remains separate from the 900
  // fish population. No fish is represented by a particle sprite.
  const particleCount = isMobile ? 180 : 320;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (random() - .5) * 45;
    particlePositions[i * 3 + 1] = (random() - .5) * 25;
    particlePositions[i * 3 + 2] = -random() * 32;
  }
  const particleGeometry = keep(new THREE.BufferGeometry());
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMaterial = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: clockUniform, uRatio: { value: pixelRatio } },
    vertexShader: `uniform float uTime,uRatio;varying float vAlpha;
      void main(){vec3 p=position;p.y+=sin(uTime*.08+p.x)*.3;p.x+=sin(uTime*.05+p.z)*.2;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(20./-mv.z,.6,2.)*uRatio;vAlpha=.13;}`,
    fragmentShader: `varying float vAlpha;void main(){float a=(1.-smoothstep(.1,.5,length(gl_PointCoord-.5)))*vAlpha;gl_FragColor=vec4(.65,.84,.83,a);}`,
  }));
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const object = new THREE.Object3D();
  const target = new THREE.Vector3();
  const free = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const avoidance = new THREE.Vector3();
  const desiredQuaternion = new THREE.Quaternion();
  const bankQuaternion = new THREE.Quaternion();
  const axisX = new THREE.Vector3(1, 0, 0);
  const worldUp = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3();
  const up = new THREE.Vector3();
  const orientation = new THREE.Matrix4();
  const cameraOffset = new THREE.Vector3();
  function samplePosition(fish: Fish, atTime: number, output: THREE.Vector3) {
    sampleSwimPosition(fish, atTime, { narrow, depth: smooth.depth }, output);
    if (smooth.tornado > .001 && fish.species === 'sardine' && fish.index < 420) {
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 18;
      sampleTornado(fish.index, fish.seed, atTime, halfHeight, camera.aspect, narrow, smooth.tornadoY, target);
      target.applyQuaternion(camera.quaternion).add(camera.position);
      output.lerp(target, smooth.tornado);
    } else if (smooth.tornado > .001) {
      cameraOffset.copy(output).project(camera);
      const dx = narrow ? cameraOffset.x : (cameraOffset.x - .5) / .6;
      const dy = (cameraOffset.y - smooth.tornadoY + (narrow ? .8 : 0)) / .5;
      const pocket = Math.exp(-Math.pow(dx, 4) - Math.pow(dy, 4));
      output.sub(camera.position).multiplyScalar(1 + pocket * smooth.tornado * 1.2).add(camera.position);
    }
    if (fish.species === 'manta' && smooth.corridor > .001) {
      const distance = 18 + smooth.corridorPhase * 18 + (1 - Math.cos(atTime * .2 + fish.index)) * 8;
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      target.set((fish.index ? -1 : 1) * (2.3 + Math.sin(atTime * .2) * 2), smooth.corridorY * halfHeight + 4 + fish.index * 1.4, -distance);
      target.applyQuaternion(camera.quaternion).add(camera.position);
      output.lerp(target, smooth.corridor);
    }
    // Preserve a quiet reading area by moving passing fish deeper along the
    // view ray. Their screen positions stay distributed above and below the copy.
    // A smooth weight avoids the old abrupt downward shove on mobile.
    const opening = (1 - clamp(smooth.depth / .17, 0, 1)) * (1 - smooth.tornado);
    if (opening > 0) {
      cameraOffset.copy(output).project(camera);
      const dx = narrow ? (cameraOffset.x + .18) / .95 : (cameraOffset.x + .48) / .6;
      const dy = narrow ? (cameraOffset.y - .24) / .33 : cameraOffset.y / .42;
      const pocket = Math.exp(-Math.pow(dx, 4) - Math.pow(dy, 4)) * opening;
      output.sub(camera.position).multiplyScalar(1 + pocket * .65).add(camera.position);
    }
    const textFormation = Math.max(smooth.vortex, smooth.corridor);
    const participates = fish.species === 'sardine' && fish.index < (smooth.vortex > smooth.corridor ? 500 : 620);
    if (textFormation > .001 && !participates) {
      cameraOffset.copy(output).project(camera);
      const centerY = smooth.vortex > smooth.corridor ? smooth.vortexY : smooth.corridorY;
      const pocket = Math.exp(-Math.pow(cameraOffset.x / .65, 4) - Math.pow((cameraOffset.y - centerY) / .45, 4));
      output.sub(camera.position).multiplyScalar(1 + pocket * textFormation * .8).add(camera.position);
    }
    if (smooth.vortex > .001 && fish.species === 'sardine' && fish.index < 500) {
      const angle = fish.seed * TAU + atTime * .23 + smooth.vortexPhase * .65;
      const distance = 15 + fish.offset.z * .7;
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const rx = halfHeight * camera.aspect * (narrow ? .95 : .72);
      const ry = halfHeight * (narrow ? .52 : .63);
      const jitter = 1 + fish.offset.y * .08;
      target.set(Math.cos(angle) * rx * jitter, Math.sin(angle) * ry * jitter + smooth.vortexY * halfHeight, -distance + Math.sin(angle * 2) * .8);
      target.applyQuaternion(camera.quaternion).add(camera.position);
      output.lerp(target, smooth.vortex);
    }
    if (smooth.corridor > .001 && fish.species === 'sardine' && fish.index < 620) {
      const sign = fish.index % 2 ? -1 : 1;
      const phase = fish.seed * TAU + atTime * .23;
      // Each stream swims into the distance, loops outside, then returns to its
      // near edge. Both position and direction stay continuous at the loop seam.
      const distance = 28 - Math.cos(phase) * 20;
      const radius = (narrow ? 3.7 : 7.5) + (1 - Math.sin(phase)) * (narrow ? 1.4 : 2.4) + fish.offset.z * .14;
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const rise = -2.8 + (distance - 8) * .17 + Math.cos(phase * 2) * .5;
      target.set(sign * radius, rise + fish.offset.y * .85 + smooth.corridorY * halfHeight, -distance);
      target.applyQuaternion(camera.quaternion).add(camera.position);
      output.lerp(target, smooth.corridor);
    }
  }
  function gridKey(x: number, y: number, z: number) { return `${Math.floor(x / .7)},${Math.floor(y / .7)},${Math.floor(z / .7)}`; }
  function updateFish(delta: number, snap: boolean) {
    // Local separation in a spatial hash avoids all-pairs checks. The school
    // flow supplies alignment/cohesion; formations blend those targets smoothly.
    grid.clear();
    if (!snap) for (const fish of allFish) {
      if (fish.species === 'manta' || fish.species === 'large') continue;
      const key = gridKey(fish.position.x, fish.position.y, fish.position.z);
      const cell = grid.get(key);
      if (cell) cell.push(fish); else grid.set(key, [fish]);
    }
    const follow = snap ? 1 : 1 - Math.exp(-delta * 3.8);
    for (const population of populations) {
      for (let i = 0; i < population.fish.length; i++) {
        const fish = population.fish[i];
        samplePosition(fish, time, free);
        samplePosition(fish, time + .04, ahead);
        direction.copy(ahead).sub(free).normalize();
        if (!reduced && fish.species !== 'large') {
          cameraOffset.copy(free).project(camera);
          const dx = cameraOffset.x - smoothPointer.x;
          const dy = cameraOffset.y + smoothPointer.y;
          const distance = dx * dx + dy * dy;
          if (distance < .05 && smoothPointer.lengthSq() > .001 && smooth.tornado < .8 && smooth.vortex < .8 && smooth.corridor < .8) {
            const strength = (.05 - distance) * 16;
            free.x += dx * strength * 5;
            free.y += dy * strength * 5;
          }
        }
        if (!snap && fish.initialized && fish.species !== 'manta' && fish.species !== 'large') {
          const neighbors = grid.get(gridKey(fish.position.x, fish.position.y, fish.position.z));
          avoidance.set(0, 0, 0);
          if (neighbors) for (const neighbor of neighbors) {
            if (neighbor === fish) continue;
            const d2 = fish.position.distanceToSquared(neighbor.position);
            if (d2 > .0001 && d2 < .12) {
              const strength = (.12 - d2) * .18 / d2;
              avoidance.x += (fish.position.x - neighbor.position.x) * strength;
              avoidance.y += (fish.position.y - neighbor.position.y) * strength;
              avoidance.z += (fish.position.z - neighbor.position.z) * strength;
            }
          }
          free.add(avoidance.clampLength(0, .16));
        }
        const initial = !fish.initialized;
        fish.velocity.copy(free).sub(fish.position);
        fish.position.lerp(free, initial ? 1 : follow);
        fish.initialized = true;
        side.crossVectors(direction, worldUp).normalize();
        up.crossVectors(side, direction).normalize();
        orientation.makeBasis(direction, up, side);
        desiredQuaternion.setFromRotationMatrix(orientation);
        const bank = fish.species === 'manta' ? (fish.index ? -.9 : 1.05) + Math.sin(time * .4 + fish.index) * .22 : Math.sin(time * .3 + fish.seed * 8) * .07;
        bankQuaternion.setFromAxisAngle(axisX, bank);
        desiredQuaternion.multiply(bankQuaternion);
        fish.heading.slerp(desiredQuaternion, snap || initial ? 1 : Math.min(1, follow * 1.6));
        object.position.copy(fish.position);
        object.quaternion.copy(fish.heading);
        object.scale.setScalar(fish.scale * (narrow ? fish.species === 'manta' ? .82 : fish.species === 'large' ? .82 : .9 : 1));
        object.updateMatrix();
        population.mesh.setMatrixAt(i, object.matrix);
      }
      population.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  function render(delta: number, snap = false) {
    if (disposed || contextLost) return;
    if (snap) { smooth = { ...state }; smoothPointer.copy(pointer); }
    const amount = 1 - Math.exp(-delta * 5);
    if (!snap) for (const key of ['depth', 'tornado', 'tornadoY', 'vortex', 'vortexPhase', 'vortexY', 'corridor', 'corridorPhase', 'corridorY'] as const) smooth[key] += (state[key] - smooth[key]) * amount;
    smooth.reading = state.reading;
    smoothPointer.lerp(pointer, amount);
    const depth = smooth.depth;
    camera.position.set(smoothPointer.x * .18, -depth * 4 - smoothPointer.y * .1, 10 - depth * 2.3);
    camera.lookAt(smoothPointer.x * .35, -depth * 4 - .15, -15);
    camera.updateMatrixWorld();
    clockUniform.value = time;
    waterUniforms.uDepth.value = depth;
    waterUniforms.uPointer.value.copy(smoothPointer);
    waterUniforms.uCorridor.value = smooth.corridor;
    (scene.fog as THREE.FogExp2).color.setRGB(.025 - depth * .018, .075 - depth * .053, .105 - depth * .064);
    (scene.fog as THREE.FogExp2).density = .027 + depth * .013;
    ambient.intensity = 1.25 - depth * .6;
    sun.intensity = 2.7 - depth * 1.7;
    rim.intensity = 1.3 - depth * .6;
    particles.position.y = -depth * 4;
    updateFish(delta, snap);
    renderer.render(scene, camera);
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || reduced || document.hidden || contextLost) return;
    const elapsed = (now - previous) / 1000;
    previous = now;
    const delta = Math.min(elapsed, .15);
    // Analytic routes follow elapsed seconds, even when rendering is slow.
    // Visibility resume resets `previous`, so hidden tabs never jump forward.
    time += elapsed * (state.reading ? .5 : 1);
    render(delta);
    // Lower resolution, not population, on slower GPUs. Exactly 900 fish stay
    // in the scene on every device. Quality reductions never create fake fish.
    frameSamples++; frameTime += elapsed;
    if (frameSamples === 120) {
      if (frameTime / frameSamples > .035 && pixelRatio > .8) {
        pixelRatio = Math.max(.8, pixelRatio * .8);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        particleMaterial.uniforms.uRatio.value = pixelRatio;
      }
      frameSamples = 0; frameTime = 0;
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (!frame && !reduced && !disposed && !document.hidden && !contextLost) {
      previous = performance.now(); frame = requestAnimationFrame(tick);
    }
  }
  function resize() {
    const width = canvas.clientWidth || innerWidth, height = canvas.clientHeight || innerHeight;
    narrow = width < 760;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    waterUniforms.uAspect.value = camera.aspect;
    render(0, true);
  }
  function onVisibility() {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else { render(0, reduced); resume(); }
  }
  function onContextLost(event: Event) {
    event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); frame = 0;
    document.documentElement.dataset.scene = 'fallback';
  }
  function onContextRestored() {
    contextLost = false; document.documentElement.dataset.scene = 'ready'; resize(); resume();
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  resize(); resume();
  return {
    setState(value) { state = { ...value }; if (reduced) render(0, true); },
    setPointer(x, y) { pointer.set(clamp(x, -1, 1), clamp(y, -1, 1)); },
    setReducedMotion(value) {
      reduced = value;
      if (value) { cancelAnimationFrame(frame); frame = 0; pointer.set(0, 0); smoothPointer.set(0, 0); render(0, true); }
      else resume();
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      for (const resource of resources) resource.dispose();
      renderer.dispose(); grid.clear();
    },
  };
}
