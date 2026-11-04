import '../styles/water-feedback.css';

/** Pointer light and brief water ripples. Native links, scrolling and focus stay in control. */
export function mountWaterFeedback(ocean: HTMLElement) {
  const layer = document.createElement('div');
  layer.className = 'water-feedback';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<div class="water-presence"></div><div class="water-ripples"></div>';
  ocean.append(layer);
  const light = layer.querySelector<HTMLElement>('.water-presence')!;
  const ripples = layer.querySelector<HTMLElement>('.water-ripples')!;
  const controller = new AbortController();
  const { signal } = controller;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const surfaces = '.button, .featured-projects-panel, .journal-card, .menu-links > a';
  const rings = new Map<HTMLElement, Animation>();
  let surface: HTMLElement | null = null;
  let frame = 0;
  let x = 0;
  let y = 0;
  const disabled = () => media.matches || document.documentElement.classList.contains('reduced-motion') || document.hidden;

  function clearHover() {
    cancelAnimationFrame(frame);
    frame = 0;
    surface?.classList.remove('water-hover');
    surface = null;
    layer.classList.remove('is-pointer-present');
  }
  function clearRipples() {
    for (const [element, animation] of rings) { animation.cancel(); element.remove(); }
    rings.clear();
  }
  function sync() {
    if (disabled() || document.body.classList.contains('menu-open')) { clearHover(); clearRipples(); }
  }
  function paint() {
    frame = 0;
    light.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
    if (surface?.isConnected) {
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--water-x', `${x - bounds.left}px`);
      surface.style.setProperty('--water-y', `${y - bounds.top}px`);
      surface.classList.add('water-hover');
    }
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !fine.matches || disabled()) return;
    const next = (event.target as Element).closest<HTMLElement>(surfaces);
    if (next !== surface) { surface?.classList.remove('water-hover'); surface = next; }
    x = event.clientX; y = event.clientY;
    layer.classList.toggle('is-pointer-present', !document.body.classList.contains('menu-open'));
    if (!frame) frame = requestAnimationFrame(paint);
  }, { signal, passive: true });
  document.addEventListener('pointerleave', clearHover, { signal });
  window.addEventListener('scroll', clearHover, { signal, passive: true });
  document.addEventListener('click', event => {
    clearHover();
    if (disabled() || event.detail === 0 || document.body.classList.contains('menu-open')) return;
    if (rings.size >= 4) {
      const [oldest, animation] = rings.entries().next().value!;
      animation.cancel(); oldest.remove(); rings.delete(oldest);
    }
    const ring = document.createElement('span');
    ring.className = 'water-ring';
    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;
    ripples.append(ring);
    const animation = ring.animate([
      { transform: 'translate(-50%, -50%) scale(.2)', opacity: .55 },
      { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 },
    ], { duration: 1050, easing: 'cubic-bezier(.15,.5,.3,1)', fill: 'both' });
    rings.set(ring, animation);
    const clean = () => { ring.remove(); rings.delete(ring); };
    void animation.finished.then(clean, clean);
  }, { signal });
  media.addEventListener('change', sync, { signal });
  fine.addEventListener('change', clearHover, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  const preferences = new MutationObserver(sync);
  preferences.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  preferences.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  return () => { controller.abort(); preferences.disconnect(); clearHover(); clearRipples(); layer.remove(); };
}
