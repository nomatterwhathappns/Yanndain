import { local, type Language } from '../content';
import { interactionCopy as copy } from '../content/interactions';
import type { OceanControls } from '../ocean/scene';
import '../styles/explorer.css';

export function mountExplorer(getOcean: () => OceanControls | undefined, getLanguage: () => Language, onChange: () => void) {
  const dialog = document.createElement('dialog');
  dialog.id = 'ocean-explorer';
  dialog.setAttribute('aria-labelledby', 'explore-title');
  dialog.innerHTML = '<div class="explore-top"><h2 id="explore-title" lang="en">Explore the ocean</h2><button class="button button-ocean explore-back" type="button"></button></div><div class="explore-water" tabindex="0" role="region" aria-describedby="explore-instruction"></div><div class="explore-bottom"><p id="explore-instruction"></p><button class="text-link explore-reset" type="button"></button></div>';
  document.body.append(dialog);
  const water = dialog.querySelector<HTMLElement>('.explore-water')!;
  const controller = new AbortController();
  const { signal } = controller;
  let x = 0, y = 0;
  let dragging: { id: number; x: number; y: number; startX: number; startY: number; moved: number } | null = null;
  let savedScroll = 0;
  let opener: HTMLElement | null = null;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  function instructions(keyboard = false) {
    const still = document.documentElement.classList.contains('reduced-motion');
    dialog.querySelector('#explore-instruction')!.textContent = local(still ? keyboard ? copy.exploreStillKeyboard : copy.exploreStill : keyboard ? copy.exploreKeyboard : matchMedia('(hover: none)').matches ? copy.exploreTouch : copy.explorePointer, getLanguage());
  }
  function pan(nextX: number, nextY: number) { x = clamp(nextX); y = clamp(nextY); getOcean()?.setView(x, y); }
  function reset() { pan(0, 0); }
  function close() { if (dialog.open) dialog.close(); }
  dialog.querySelector('.explore-back')!.addEventListener('click', close, { signal });
  dialog.querySelector('.explore-reset')!.addEventListener('click', reset, { signal });
  water.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    water.focus({ preventScroll: true });
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: x, startY: y, moved: 0 };
    water.setPointerCapture(event.pointerId);
    instructions();
  }, { signal });
  water.addEventListener('pointermove', event => {
    if (dragging?.id === event.pointerId) {
      const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y;
      dragging.moved = Math.max(dragging.moved, Math.hypot(dx, dy));
      pan(dragging.startX - dx / innerWidth * 2, dragging.startY + dy / innerHeight * 2);
      getOcean()?.clearPointer();
    } else if (event.pointerType === 'mouse') {
      getOcean()?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1, .15);
    }
  }, { signal });
  water.addEventListener('pointerup', event => {
    if (dragging?.id !== event.pointerId) return;
    if (dragging.moved < 8) getOcean()?.ripple(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
    dragging = null;
  }, { signal });
  water.addEventListener('pointercancel', () => { dragging = null; }, { signal });
  water.addEventListener('lostpointercapture', () => { dragging = null; }, { signal });
  water.addEventListener('pointerleave', () => { if (!dragging) getOcean()?.clearPointer(); }, { signal });
  water.addEventListener('keydown', event => {
    const step = .12;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', ' '].includes(event.key)) {
      event.preventDefault(); instructions(true);
      if (event.key === 'Home') reset();
      else if (event.key === ' ') getOcean()?.ripple(0, 0);
      else pan(x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0));
    }
  }, { signal });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    instructions(true);
    const first = dialog.querySelector<HTMLElement>('.explore-back')!;
    const last = dialog.querySelector<HTMLElement>('.explore-reset')!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, { signal });
  dialog.addEventListener('close', () => {
    dragging = null;
    document.body.classList.remove('ocean-exploring');
    getOcean()?.clearPointer(); reset(); onChange();
    window.scrollTo({ top: savedScroll, behavior: 'instant' });
    opener?.focus({ preventScroll: true });
  }, { signal });
  return {
    get active() { return dialog.open; },
    open(returnFocus: HTMLElement, keyboard = false) {
      if (!getOcean() || document.documentElement.dataset.scene !== 'ready') return;
      opener = returnFocus; savedScroll = scrollY;
      dialog.querySelector('.explore-back')!.textContent = local(copy.back, getLanguage());
      dialog.querySelector('.explore-reset')!.textContent = local(copy.reset, getLanguage());
      water.setAttribute('aria-label', local(copy.viewLabel, getLanguage()));
      instructions(keyboard);
      getOcean()?.clearPointer(); reset();
      document.body.classList.add('ocean-exploring');
      dialog.showModal(); onChange();
      water.focus({ preventScroll: true });
    },
    close,
    dispose() { close(); controller.abort(); dialog.remove(); },
  };
}
