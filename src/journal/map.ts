import { local, type Language } from '../content';
import { journalFilters, journalMapCopy, journalStops } from '../content/journal-map';
import { mountRouteTraveler } from './route-motion';
import { interactionCopy, discoverFeature } from '../content/interactions';
import '../styles/journal-map.css';

const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

const desktopRoute = 'M96 490C60 432 102 364 174 364H234Q280 364 280 318V248Q280 204 336 168C390 128 464 140 482 198C522 300 400 310 422 398S514 530 564 532C674 544 715 505 705 447C690 365 586 394 585 316C585 245 680 226 728 252C805 295 744 348 806 365C893 390 960 301 932 223Q914 168 864 147C948 85 1080 113 1084 190Q1088 228 1056 250L1016 290Q976 330 1008 366L1092 448';
const mobileRoute = 'M126 120C190 90 260 100 262 162Q264 204 320 204H396Q462 204 462 288C462 346 362 356 322 306C288 265 212 282 212 328V386Q212 426 156 460C80 498 112 592 198 572L282 548Q334 526 356 570L388 614Q410 648 456 648C500 654 510 738 460 770C416 800 360 744 300 756Q250 766 192 804';
function routeChart(mobile: boolean) {
  const path = mobile ? mobileRoute : desktopRoute;
  return `<svg class="map-route map-route-${mobile ? 'mobile' : 'desktop'}" viewBox="${mobile ? '0 0 600 900' : '0 0 1200 700'}" preserveAspectRatio="none" aria-hidden="true">
    <path class="map-route-branch" d="${mobile ? 'M126 120C50 198 72 242 164 244L246 244Q292 244 292 290M456 648C535 578 530 452 428 438S300 424 212 386' : 'M96 490C30 288 110 117 244 106Q294 108 336 168M564 532C732 640 980 600 1092 448M585 316C534 264 574 120 686 123L786 123Q826 122 864 147'}"/>
    <path class="map-route-halo" d="${path}"/>
    <path class="map-route-line" d="${path}"/>
    <path class="map-route-selection" d="${path}" pathLength="100"/>
    <circle class="map-route-destination" r="7"/>
    <g class="map-traveler">
      <ellipse class="map-fish-glow" cx="-3" cy="0" rx="28" ry="15"/>
      <path class="map-fish-fin" d="M-2-5-9-13-8-3M-2 5-9 13-8 3"/>
      <path class="map-fish-tail" d="M-12 0-26-9-23 0-26 9Z"/>
      <path class="map-fish-body" d="M16 0C9-10-5-11-15 0C-5 11 9 10 16 0Z"/>
      <path class="map-fish-spine" d="M-12 0H10"/>
      <circle class="map-fish-eye" cx="9" cy="-2" r="1.2"/>
    </g>
  </svg>`;
}

export function learningMap(language: Language) {
  const t = (value: Parameters<typeof local>[0]) => escape(local(value, language));
  return `<div class="map-toolbar">
    <div class="map-topic-controls" role="group" aria-label="${t(interactionCopy.mapTopics)}"><span>${t(interactionCopy.mapTopics)}</span>${journalFilters.map(({ id, label }) => `<button type="button" data-map-filter="${id}" aria-pressed="${id === 'all'}">${t(label)}</button>`).join('')}</div>
    <button type="button" class="map-guide-next text-link">${t(interactionCopy.mapGuide)}</button>
    </div><div class="learning-map" role="group" aria-label="${t(journalMapCopy.label)}">
    <svg class="map-terrain" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
      <defs><radialGradient id="map-depth"><stop stop-color="#559394" stop-opacity=".12"/><stop offset="1" stop-color="#559394" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="210" cy="90" rx="360" ry="230" fill="url(#map-depth)"/>
      <ellipse cx="1050" cy="570" rx="420" ry="300" fill="url(#map-depth)"/>
      <g class="map-contours">
        <path class="map-island" d="M538 158C548 114 606 90 652 108S730 150 722 182S660 217 622 197S524 204 538 158Z"/>
        <path d="M558 157C570 126 605 113 646 129S707 153 701 175S655 192 628 178S551 183 558 157Z"/>
        <path d="M583 156C596 140 611 137 640 147S681 157 675 168S650 171 631 162S578 169 583 156Z"/>
        <path class="map-island" d="M803 479C830 422 898 413 925 456S1024 487 1007 531S927 558 893 579S815 574 801 542S777 510 803 479Z"/>
        <path d="M822 485C843 445 883 438 907 472S996 500 985 526S928 534 897 554S839 552 824 532S803 509 822 485Z"/>
        <path d="M844 493C863 471 879 465 895 491S964 510 958 522S922 513 900 533S857 527 849 521S833 510 844 493Z"/>
        <path d="M-50 240C70 300 130 180 260 200S410 110 380 20S270-80 190-30"/>
        <path d="M-40 210C60 267 139 151 255 170S374 98 350 20S260-50 190-10"/>
        <path d="M-20 180C70 225 147 125 250 140S343 84 320 20S254-20 190 10"/>
        <path d="M0 145C75 184 157 100 245 109S308 72 290 25S249 10 191 35"/>
        <path d="M30 112C93 142 160 76 239 77S275 58 263 31S235 35 192 57"/>
        <path d="M680 660C600 550 700 410 850 440S1000 330 1110 350S1270 430 1260 540"/>
        <path d="M725 655C650 550 725 443 853 472S1017 366 1110 383S1225 448 1225 540"/>
        <path d="M767 651C702 554 755 478 859 505S1035 402 1113 416S1190 463 1190 544"/>
        <path d="M812 647C756 560 789 513 870 539S1046 439 1114 451S1155 484 1155 549"/>
        <path d="M860 646C816 572 830 550 883 573S1063 477 1112 486S1121 510 1120 557"/>
      </g>
    </svg>
    ${routeChart(false)}${routeChart(true)}
    <ol class="map-stops">${journalStops.map((stop, i) => `<li class="map-stop${i === 1 || i === 3 ? ' note-below' : ''}${i === 0 ? ' mobile-note-below' : ''}${stop.mobileX > 50 ? ' mobile-stop-right' : ''}" style="--stop-x:${stop.x}%;--stop-y:${stop.y}%;--mobile-x:${stop.mobileX}%;--mobile-y:${stop.mobileY}%">
      <button type="button" class="map-node" data-map-node="${stop.id}" aria-expanded="false" aria-controls="map-note-${stop.id}"><span class="map-node-dot" aria-hidden="true"></span><span class="map-node-name"><span class="map-node-period">${t(stop.period)}</span><span lang="en">${escape(stop.title)}</span></span></button>
      <div class="map-note" id="map-note-${stop.id}" role="region" aria-labelledby="map-title-${stop.id}" hidden><button type="button" class="map-note-close" aria-label="${t(journalMapCopy.close)}"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.2"/></svg></button><span class="map-note-status">${t(stop.period)}</span><h3 id="map-title-${stop.id}" lang="en">${escape(stop.title)}</h3><p>${t(stop.description)}</p></div>
    </li>`).join('')}</ol>
  </div>`;
}

export function mountLearningMap(root: HTMLElement | null) {
  if (!root) return () => {};
  const controller = new AbortController();
  const { signal } = controller;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-map-node]')];
  const traveler = mountRouteTraveler(root);
  const toolbar = root.previousElementSibling!;
  let active: HTMLButtonElement | null = null;
  let pinned: HTMLButtonElement | null = null;
  let mode: 'hover' | 'keyboard' | 'touch' = 'keyboard';
  let input = 'keyboard';
  let closeTimer = 0;
  const cancelClose = () => { clearTimeout(closeTimer); closeTimer = 0; };
  const show = (button: HTMLButtonElement | null, nextMode = mode) => {
    cancelClose();
    active = button;
    mode = nextMode;
    if (!button) pinned = null;
    traveler.setPaused(button !== null);
    traveler.highlightStop(button ? buttons.indexOf(button) : null);
    if (button) discoverFeature('map-nodes');
    for (const item of buttons) {
      const active = item === button;
      item.setAttribute('aria-expanded', String(active));
      item.closest('.map-stop')!.classList.toggle('is-active', active);
      root.querySelector<HTMLElement>(`#${item.getAttribute('aria-controls')}`)!.hidden = !active;
    }
  };
  const closeSoon = () => {
    if (mode !== 'hover') return;
    cancelClose();
    // A short bridge lets the cursor reach the note without leaving it stuck open.
    closeTimer = window.setTimeout(() => show(null), 180);
  };
  document.addEventListener('pointerdown', event => { input = event.pointerType; }, { signal, capture: true });
  document.addEventListener('keydown', () => { input = 'keyboard'; }, { signal, capture: true });
  for (const button of buttons) {
    const note = root.querySelector<HTMLElement>(`#${button.getAttribute('aria-controls')}`)!;
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') { pinned = null; show(button, 'hover'); }
    }, { signal });
    button.addEventListener('pointerleave', closeSoon, { signal });
    note.addEventListener('pointerenter', cancelClose, { signal });
    note.addEventListener('pointerleave', closeSoon, { signal });
    button.addEventListener('focus', () => {
      if (input !== 'touch') show(button, input === 'keyboard' ? 'keyboard' : 'hover');
    }, { signal });
    button.addEventListener('click', event => {
      // Mouse clicks never pin a tooltip just because the button received focus.
      if (event.detail !== 0 && input !== 'touch') { pinned = null; show(button, 'hover'); return; }
      pinned = pinned === button ? null : button;
      show(pinned, input === 'touch' ? 'touch' : 'keyboard');
    }, { signal });
    button.addEventListener('keydown', event => {
      const index = buttons.indexOf(button);
      const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % buttons.length
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index + buttons.length - 1) % buttons.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
      if (next !== null) { event.preventDefault(); pinned = null; buttons[next].focus(); }
    }, { signal });
    note.querySelector('button')!.addEventListener('click', () => {
      button.focus({ preventScroll: true });
      show(null);
    }, { signal });
  }
  root.addEventListener('pointerleave', closeSoon, { signal });
  root.addEventListener('focusout', event => {
    if (mode !== 'hover' && !active?.closest('.map-stop')?.contains(event.relatedTarget as Node | null)) show(null);
  }, { signal });
  root.addEventListener('click', event => {
    if ((event.target as Element).closest('.map-node, .map-note')) return;
    show(null);
    if (traveler.guideTo(event.clientX, event.clientY)) discoverFeature('map-route');
  }, { signal });
  toolbar.querySelector('.map-guide-next')!.addEventListener('click', () => {
    show(null); traveler.guideNext(); discoverFeature('map-route');
  }, { signal });
  const groupsByStop = new Map(journalStops.map(stop => [stop.id, stop.groups]));
  for (const button of toolbar.querySelectorAll<HTMLButtonElement>('[data-map-filter]')) {
    button.addEventListener('click', () => {
      show(null);
      const category = button.dataset.mapFilter!;
      toolbar.querySelectorAll<HTMLButtonElement>('[data-map-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      for (const node of buttons) {
        const related = category === 'all' || (groupsByStop.get(node.dataset.mapNode!)?.includes(category) ?? false);
        node.closest('.map-stop')!.classList.toggle('is-unrelated', !related);
        node.closest('.map-stop')!.classList.toggle('is-related', category !== 'all' && related);
      }
    }, { signal });
  }
  document.addEventListener('click', event => {
    if (!root.contains(event.target as Node)) show(null);
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') show(null);
  }, { signal });
  return () => { cancelClose(); controller.abort(); traveler.dispose(); };
}
