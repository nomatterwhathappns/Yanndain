import { local, type Language } from '../content';
import { interactionCopy as copy, type DiscoveryId } from '../content/interactions';
import '../styles/discovery.css';

const key = 'yanndain-discoveries-v1';
const known = new Set<DiscoveryId>();
try { for (const id of JSON.parse(sessionStorage.getItem(key) || '[]')) known.add(id); } catch { /* Optional session memory. */ }

/** One contextual cue at a time; never moves focus, captures a pointer or blocks content. */
export function mountDiscovery(getLanguage: () => Language) {
  const layer = document.createElement('div');
  layer.className = 'discovery-cue';
  layer.hidden = true;
  layer.innerHTML = '<span class="discovery-light" aria-hidden="true"></span><p></p><button type="button">×</button>';
  document.body.append(layer);
  const controller = new AbortController();
  const { signal } = controller;
  let input = matchMedia('(hover: none)').matches ? 'touch' : 'mouse';
  let active: DiscoveryId | null = null;
  let target: Element | null = null;
  let pending = 0;
  let expiry = 0;
  let observer: IntersectionObserver | undefined;
  const offered = new Set<DiscoveryId>();
  const visible = new Set<Element>();
  const definitions: { id: DiscoveryId; selector: string; marker: string; motion?: boolean }[] = [
    { id: 'ocean', selector: '#surface', marker: '.hero-actions', motion: true },
    { id: 'tornado', selector: '#about', marker: '.about-space', motion: true },
    { id: 'vortex', selector: '#curiosity', marker: '.bridge-copy', motion: true },
    { id: 'map-nodes', selector: '.learning-map', marker: '.map-node' },
    { id: 'map-route', selector: '.learning-map', marker: '.map-guide-next' },
    { id: 'project-preview', selector: '.featured-projects-panel', marker: '.project-peek summary' },
    { id: 'project-scroll', selector: '.featured-projects-panel', marker: '.featured-projects-list' },
    { id: 'corridor', selector: '#contact', marker: '.contact-copy', motion: true },
  ];
  function textFor(id: DiscoveryId) {
    const touch = input === 'touch', keyboard = input === 'keyboard';
    const value = id === 'map-nodes' ? keyboard ? copy.mapNodesKeyboard : touch ? copy.mapNodesTouch : copy.mapNodes
      : id === 'map-route' ? keyboard ? copy.mapRouteKeyboard : touch ? copy.mapRouteTouch : copy.mapRoute
      : id === 'project-preview' ? copy.projectPreview : id === 'project-scroll' ? copy.projectScroll
      : id === 'ocean' ? touch ? copy.oceanTouch : copy.ocean
      : touch ? copy.formationTouch : copy[id];
    return local(value, getLanguage());
  }
  function clear() {
    clearTimeout(pending); clearTimeout(expiry);
    pending = 0;
    target?.classList.remove('discovery-target');
    target = null; active = null; layer.hidden = true;
  }
  const blocked = () => document.hidden || document.body.classList.contains('menu-open') || document.body.classList.contains('ocean-exploring');
  function choose() {
    clearTimeout(pending);
    if (blocked()) { clear(); return; }
    const current = definitions.find(def => visible.has(document.querySelector(def.selector)!) && !known.has(def.id) && !offered.has(def.id)
      && !(def.motion && (input === 'keyboard' || document.documentElement.classList.contains('reduced-motion') || document.documentElement.dataset.scene !== 'ready'))
      && !(def.id === 'project-scroll' && (() => { const el = document.querySelector<HTMLElement>(def.selector)!; return el.scrollHeight <= el.clientHeight + 5; })()));
    if (active && current?.id === active) return;
    if (active) clear();
    if (!current) return;
    pending = window.setTimeout(() => {
      if (blocked()) return;
      active = current.id;
      const candidates = [...document.querySelectorAll(current.marker)];
      target = candidates.find(el => { const rect = el.getBoundingClientRect(); return rect.top > 90 && rect.bottom < innerHeight - 70; }) || null;
      // The visual cue belongs on an actual control; headings never pulse.
      if (['map-nodes', 'map-route', 'project-preview'].includes(active)) target?.classList.add('discovery-target');
      layer.dataset.feature = active;
      layer.querySelector('p')!.textContent = textFor(active);
      layer.querySelector('button')!.setAttribute('aria-label', local(copy.dismiss, getLanguage()));
      layer.hidden = false;
      expiry = window.setTimeout(() => { if (layer.contains(document.activeElement)) return; if (active) offered.add(active); clear(); }, 9000);
    }, 1000);
  }
  function refresh() {
    clear(); observer?.disconnect(); visible.clear();
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target);
      choose();
    }, { rootMargin: '-18% 0px -28% 0px', threshold: 0 });
    for (const selector of new Set(definitions.map(def => def.selector))) {
      const el = document.querySelector(selector); if (el) observer.observe(el);
    }
  }
  document.addEventListener('feature-discovered', event => {
    const id = (event as CustomEvent<DiscoveryId>).detail;
    if (known.has(id)) return;
    known.add(id);
    try { sessionStorage.setItem(key, JSON.stringify([...known])); } catch { /* Optional. */ }
    if (active === id) clear();
    choose();
  }, { signal });
  layer.querySelector('button')!.addEventListener('click', () => { if (active) offered.add(active); clear(); }, { signal });
  document.addEventListener('pointerdown', event => { input = event.pointerType === 'touch' ? 'touch' : 'mouse'; if (active) layer.querySelector('p')!.textContent = textFor(active); }, { signal, passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' || event.key.startsWith('Arrow')) { input = 'keyboard'; if (active) { offered.delete(active); clear(); choose(); } }
    if (event.key === 'Escape' && active) { offered.add(active); clear(); }
  }, { signal });
  document.addEventListener('visibilitychange', choose, { signal });
  const modes = new MutationObserver(choose);
  modes.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  modes.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-scene'] });
  return {
    refresh,
    replay() { known.clear(); offered.clear(); try { sessionStorage.removeItem(key); } catch { /* Optional. */ } refresh(); },
    dispose() { clear(); observer?.disconnect(); modes.disconnect(); controller.abort(); layer.remove(); },
  };
}
