import type { OceanControls } from '../ocean/scene';
import { discoverFeature, type DiscoveryId } from '../content/interactions';

const controls = 'a, button, summary, input, textarea, select, h1, h2, h3, h4, p, .learning-map, .featured-projects-panel, .inner-page, .site-header';
export function mountOceanInput(getOcean: () => OceanControls | undefined, isReduced: () => boolean) {
  const controller = new AbortController();
  const { signal } = controller;
  let lastX = 0, lastY = 0, lastTime = 0;
  let travel = 0;
  let section: string | undefined;
  const blocked = () => isReduced() || document.body.classList.contains('menu-open') || document.body.classList.contains('ocean-exploring');
  const feature = (target: Element): DiscoveryId => {
    const id = target.closest('section')?.id;
    return id === 'about' ? 'tornado' : id === 'curiosity' ? 'vortex' : id === 'contact' ? 'corridor' : 'ocean';
  };
  document.addEventListener('pointermove', event => {
    const ocean = getOcean();
    if (!ocean || event.pointerType !== 'mouse' || blocked() || (event.target as Element).closest(controls)) { ocean?.clearPointer(); return; }
    const now = performance.now();
    const distance = lastTime && now - lastTime < 160 ? Math.hypot(event.clientX - lastX, event.clientY - lastY) : 0;
    const speed = Math.min(1, distance / Math.max(8, now - lastTime) / 1.4);
    lastX = event.clientX; lastY = event.clientY; lastTime = now;
    ocean.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1, speed);
    const id = feature(event.target as Element);
    if (section !== id) { section = id; travel = 0; }
    travel += distance;
    if (travel > 100) { discoverFeature(id); travel = 0; }
  }, { signal, passive: true });
  document.addEventListener('click', event => {
    if (event.detail === 0 || blocked() || (event.target as Element).closest(controls) || window.getSelection()?.toString()) return;
    const ocean = getOcean(); if (!ocean) return;
    ocean.ripple(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
    discoverFeature(feature(event.target as Element));
  }, { signal });
  const clear = () => { lastTime = 0; getOcean()?.clearPointer(); };
  document.addEventListener('pointerleave', clear, { signal });
  window.addEventListener('scroll', clear, { signal, passive: true });
  window.addEventListener('blur', clear, { signal });
  return () => { controller.abort(); clear(); };
}
