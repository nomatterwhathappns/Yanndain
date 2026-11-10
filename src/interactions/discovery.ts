import { type DiscoveryId } from '../content/interactions';
import '../styles/discovery.css';

const key = 'yanndain-discoveries-v1';
const known = new Set<DiscoveryId>();
try { for (const id of JSON.parse(sessionStorage.getItem(key) || '[]')) known.add(id); } catch { /* Optional session memory. */ }

type Point = { x: number; y: number };
type Definition = { id: DiscoveryId; selector: string; marker?: string; action: 'hover' | 'press' | 'scroll' | 'sweep'; motion?: boolean };
type Anchor = { definition: Definition; target: Element; position: () => Point | null; score: number };
const definitions: Definition[] = [
  { id: 'ocean', selector: '#surface', action: 'sweep', motion: true },
  { id: 'tornado', selector: '#about', marker: '.about-space', action: 'sweep', motion: true },
  { id: 'project-preview', selector: '.featured-projects-panel', marker: '.project-peek summary', action: 'press' },
  { id: 'project-scroll', selector: '.featured-projects-panel', action: 'scroll' },
  { id: 'vortex', selector: '#curiosity', action: 'sweep', motion: true },
  { id: 'map-nodes', selector: '.learning-map', marker: '.map-node', action: 'hover' },
  { id: 'map-route', selector: '.learning-map', action: 'press' },
  { id: 'corridor', selector: '#contact', action: 'sweep', motion: true },
];

/** Silent, local demonstrations. They never simulate input or change the actual feature. */
export function mountDiscovery() {
  const layer = document.createElement('div');
  layer.className = 'discovery-demo';
  layer.setAttribute('aria-hidden', 'true');
  layer.hidden = true;
  layer.innerHTML = `<span class="discovery-ripple"></span><span class="discovery-trail"></span>
    <span class="discovery-gesture">
      <svg class="discovery-cursor" viewBox="0 0 32 40"><path d="M3 3 25 20 15 22 10 33Z"/></svg>
      <svg class="discovery-hand" viewBox="0 0 40 48"><path d="M14 22V6a3 3 0 0 1 6 0v14-6a3 3 0 0 1 6 0v7-4a3 3 0 0 1 6 0v6-2a3 3 0 0 1 6 0v10c0 8-4 13-12 13h-2c-4 0-6-2-9-6L5 27c-2-3 2-6 5-3l4 4Z"/></svg>
      <svg class="discovery-mouse" viewBox="0 0 32 44"><rect x="4" y="2" width="24" height="38" rx="12"/><path class="discovery-wheel" d="M16 10v7"/></svg>
    </span>`;
  document.body.append(layer);
  const controller = new AbortController();
  const { signal } = controller;
  let input = matchMedia('(hover: none)').matches ? 'touch' : 'mouse';
  let active: Anchor | null = null;
  let pending = 0, expiry = 0, frame = 0;
  let observer: IntersectionObserver | undefined;
  const offered = new Set<DiscoveryId>();
  const blocked = () => document.hidden || input === 'keyboard' || document.body.classList.contains('menu-open') || document.body.classList.contains('ocean-exploring');
  const motionUnavailable = () => document.documentElement.classList.contains('reduced-motion') || document.documentElement.dataset.scene !== 'ready';

  function clear() {
    clearTimeout(pending); clearTimeout(expiry); pending = 0;
    active?.target.classList.remove('discovery-target');
    active = null; layer.hidden = true;
  }
  function finish() {
    if (active) offered.add(active.definition.id);
    clear();
  }
  function inView(point: Point, root: Element) {
    const rect = root.getBoundingClientRect();
    const top = Math.max(100, (document.querySelector('header')?.getBoundingClientRect().bottom || 0) + 40, rect.top + 24);
    return point.x > Math.max(42, rect.left + 18) && point.x < Math.min(innerWidth - 64, rect.right - 18)
      && point.y > top && point.y < Math.min(innerHeight - 72, rect.bottom - 32);
  }
  function anchorFor(definition: Definition): Anchor | null {
    const root = document.querySelector<HTMLElement>(definition.selector);
    if (!root || known.has(definition.id) || offered.has(definition.id)) return null;
    if (definition.motion && motionUnavailable()) return null;
    if (definition.id.startsWith('map-') && root.querySelector('.map-note:not([hidden])')) return null;
    const rect = root.getBoundingClientRect();
    // Prefer the section occupying the screen, not the next section just entering it.
    const score = Math.max(0, Math.min(innerHeight - 72, rect.bottom) - Math.max(100, rect.top));
    if (!score) return null;
    const anchor = (target: Element, point: () => Point): Anchor | null => {
      const position = () => { const p = point(); return target.isConnected && inView(p, root) ? p : null; };
      return position() ? { definition, target, position, score } : null;
    };
    if (definition.marker) {
      for (const target of root.querySelectorAll<HTMLElement>(definition.marker)) {
        if (!target.getClientRects().length) continue;
        const result = anchor(target, () => {
          const r = target.getBoundingClientRect();
          return { x: r.left + r.width * .5, y: r.top + r.height * .5 };
        });
        if (result) return result;
      }
      return null;
    }
    if (definition.id === 'project-scroll') {
      if (root.scrollHeight <= root.clientHeight + 5) return null;
      return anchor(root, () => {
        const r = root.getBoundingClientRect();
        return { x: r.right - 38, y: (Math.max(120, r.top) + Math.min(innerHeight - 100, r.bottom)) / 2 };
      });
    }
    if (definition.id === 'map-route') {
      const path = [...root.querySelectorAll<SVGPathElement>('.map-route-line')].find(el => el.getBoundingClientRect().width > 0);
      if (!path) return null;
      const length = path.getTotalLength();
      for (const fraction of [.28, .56, .76, .12]) {
        const point = path.getPointAtLength(length * fraction);
        const result = anchor(path, () => {
          const matrix = path.getScreenCTM();
          return matrix ? new DOMPoint(point.x, point.y).matrixTransform(matrix) : { x: -100, y: -100 };
        });
        const position = result?.position();
        if (position && ![...root.querySelectorAll('.map-node')].some(node => {
          const r = node.getBoundingClientRect();
          return Math.hypot(r.left + r.width / 2 - position.x, r.top + r.height / 2 - position.y) < 80;
        })) return result;
      }
      return null;
    }
    return anchor(root, () => {
      const r = root.getBoundingClientRect();
      const mobile = innerWidth <= 760;
      // Open water beside the copy, where the actual fish interaction lives.
      return { x: r.left + r.width * (mobile ? .22 : .8), y: r.top + r.height * (mobile ? .78 : .5) };
    });
  }
  function positionActive() {
    const point = active?.position();
    if (!point) { clear(); return; }
    layer.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
  }
  function choose() {
    clearTimeout(pending);
    if (blocked()) { clear(); return; }
    if (active && active.position() && !(active.definition.motion && motionUnavailable())
      && !(active.definition.id.startsWith('map-') && document.querySelector('.map-note:not([hidden])'))) return;
    clear();
    pending = window.setTimeout(() => {
      if (blocked()) return;
      const candidate = definitions.map(anchorFor).filter((item): item is Anchor => !!item).sort((a, b) => b.score - a.score)[0];
      if (!candidate) return;
      active = candidate;
      layer.dataset.feature = candidate.definition.id;
      layer.dataset.input = input;
      layer.dataset.action = candidate.definition.action;
      if (candidate.definition.marker && !candidate.definition.motion) candidate.target.classList.add('discovery-target');
      positionActive();
      layer.hidden = false;
      expiry = window.setTimeout(finish, 6400);
    }, 1200);
  }
  function layoutChanged() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (active) positionActive();
      choose();
    });
  }
  function refresh() {
    clear(); observer?.disconnect();
    observer = new IntersectionObserver(layoutChanged, { rootMargin: '-100px 0px -72px 0px' });
    for (const selector of new Set(definitions.map(def => def.selector))) {
      const el = document.querySelector(selector); if (el) observer.observe(el);
    }
    choose();
  }
  document.addEventListener('feature-discovered', event => {
    const id = (event as CustomEvent<DiscoveryId>).detail;
    if (known.has(id)) return;
    known.add(id);
    try { sessionStorage.setItem(key, JSON.stringify([...known])); } catch { /* Optional. */ }
    if (active?.definition.id === id) clear();
    choose();
  }, { signal });
  document.addEventListener('pointerdown', event => {
    input = event.pointerType === 'touch' ? 'touch' : 'mouse';
    if (active) finish();
  }, { signal, passive: true });
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    if (input !== 'mouse') { input = 'mouse'; choose(); }
    const point = active?.position();
    // Yield immediately when the visitor's real cursor reaches the demonstration.
    if (point && Math.hypot(event.clientX - point.x, event.clientY - point.y) < 40) finish();
  }, { signal, passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) { input = 'keyboard'; clear(); }
    if (event.key === 'Escape') finish();
  }, { signal });
  document.addEventListener('scroll', layoutChanged, { signal, capture: true, passive: true });
  window.addEventListener('resize', layoutChanged, { signal, passive: true });
  document.addEventListener('visibilitychange', choose, { signal });
  const modes = new MutationObserver(choose);
  modes.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  modes.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-scene'] });
  const controls = new MutationObserver(choose);
  controls.observe(document.querySelector('#content')!, { subtree: true, attributes: true, attributeFilter: ['aria-expanded', 'open'] });
  return {
    refresh,
    replay() { known.clear(); offered.clear(); try { sessionStorage.removeItem(key); } catch { /* Optional. */ } refresh(); },
    dispose() { clear(); cancelAnimationFrame(frame); observer?.disconnect(); modes.disconnect(); controls.disconnect(); controller.abort(); layer.remove(); },
  };
}
