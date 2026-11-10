import '@fontsource-variable/manrope';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '../styles/main.css';
import '../styles/featured-projects.css';
import '../styles/project-detail.css';
import { article, copy, local, profile, projects, words, type Language, type Localized, type Project } from '../content';
import type { OceanControls, OceanState } from '../ocean/scene';
import { learningMap, mountLearningMap } from '../journal/map';
import { journalMapCopy } from '../content/journal-map';
import { mountWaterFeedback } from '../interactions/water-feedback';
import { interactionCopy } from '../content/interactions';
import { mountDiscovery } from '../interactions/discovery';
import { mountOceanInput } from '../interactions/ocean-input';
import { mountExplorer } from '../interactions/explorer';
import { mountProjectPreviews, type ProjectPosition } from '../interactions/project-preview';

const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
const storage = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Optional preference. */ } },
};
const portable = document.documentElement.dataset.portable === 'true' || location.protocol === 'file:';
const media = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = storage.get('yanndain-motion') ? storage.get('yanndain-motion') === 'reduced' : media.matches;
let language: Language = storage.get('yanndain-language') === 'en' ? 'en' : 'id';
let route = '/';
let ocean: OceanControls | undefined;
let revealObserver: IntersectionObserver | undefined;
let disposeLearningMap: (() => void) | undefined;
let queued = false;
let savedHomeScroll = 0;
let navigationToken = 0;
let pageTransition: Animation | undefined;
let projectPosition: ProjectPosition = { scroll: 0, open: null };
let projectPreviews: ReturnType<typeof mountProjectPreviews> | undefined;
const main = $('#content');
const menu = $<HTMLDialogElement>('#site-menu');
const disposeWaterFeedback = mountWaterFeedback($('.ocean-world'));
const discovery = mountDiscovery();
const explorer = mountExplorer(() => ocean, () => language, () => updateScene());
const disposeOceanInput = mountOceanInput(() => ocean, () => reduced);
const t = (value: Localized) => local(value, language);
const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
function href(path: string, lang = language) { return `${portable ? '#' : ''}/${lang}${path === '/' ? '' : path}`; }
function writeLocation(url: string, replace = false) {
  try {
    history[replace ? 'replaceState' : 'pushState']({ route, language }, '', url);
  } catch {
    // Some embedded HTML previews have an opaque origin and disallow history
    // writes. Navigation still renders in memory in that restricted container.
  }
}
function arrow(direction: 'down' | 'up' | 'back') {
  const paths = { down: 'M12 4v16m-6-6 6 6 6-6', up: 'M12 20V4m-6 6 6-6 6 6', back: 'M20 12H4m6-6-6 6 6 6' };
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${paths[direction]}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function routeLink(path: string, text: string, className = 'text-link') {
  return `<a class="${className}" href="${href(path)}" data-route="${path}"><span>${text}</span></a>`;
}
function sectionHref(section: string) { return `${href('/')}${portable ? '?section=' : '#'}${section}`; }
function sectionLink(section: string, text: string, className = 'text-link', direction: 'down' | 'up' | 'back' | null = 'down') {
  const url = sectionHref(section);
  return `<a class="${className}" href="${url}" data-section="${section}"><span>${text}</span>${direction ? arrow(direction) : ''}</a>`;
}
function cvLink() {
  const url = profile.cv[language] || profile.cv.en || profile.cv.id;
  return url ? `<a class="text-link cv-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer"><span>${t(copy.viewCV)}</span></a>` : '';
}
function heading(first: string, second: string, tag = 'h2') {
  return `<${tag} lang="en">${escape(first)}<br><em>${escape(second)}</em></${tag}>`;
}
function featuredProjectRow(project: Project, index: number) {
  return `<li class="featured-project">
    <a class="featured-project-link" href="${href(`/projects/${project.slug}`)}" data-route="/projects/${project.slug}">
      <span class="featured-project-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <div class="featured-project-title"><span class="featured-project-category" lang="en">${escape(project.category)}</span><h3 lang="en">${escape(project.title)}</h3></div>
      <div class="featured-project-description"><span class="preview-badge">${t(copy.preview)}</span><p>${t(project.description)}</p></div>
    </a>
    <details class="project-peek" data-project="${project.slug}"><summary>${t(interactionCopy.peek)}</summary>
      <div class="project-peek-content">${project.sections.slice(0, 2).map(section => `<div><h4 lang="en">${escape(section.title)}</h4><p>${t(section.description)}</p></div>`).join('')}${routeLink(`/projects/${project.slug}`, t(interactionCopy.detail), 'text-link')}</div>
    </details>
  </li>`;
}
function journalCard() {
  return `<a class="journal-card reveal" href="${href(`/journal/${article.slug}`)}" data-route="/journal/${article.slug}">
    <div class="journal-art" aria-hidden="true"><div class="journal-light"></div><div class="journal-water"></div></div>
    <div class="journal-card-copy"><span class="preview-badge">${t(copy.preview)}</span><h3 lang="en">${escape(article.title)}</h3><p>${t(article.description)}</p></div>
  </a>`;
}
function footer() {
  return `<footer><a href="${href('/')}" data-route="/" class="footer-brand">yanndain</a>${sectionLink('surface', t(copy.surface), 'text-link', 'up')}</footer>`;
}
function home() {
  return `
    <section class="hero section" id="surface">
      <div class="hero-copy">
        <p class="identity">Yanndain <span>/</span> <span>${escape(profile.name)}</span></p>
        <h1 lang="en"><span>${copy.heroFirst}</span><span>${copy.heroSecond}</span></h1>
        <p class="hero-description">${t(copy.heroDescription)}</p>
        <div class="hero-actions">${sectionLink('projects', t(copy.dive), 'button button-ocean', 'down')}${cvLink()}</div>
      </div>
    </section>
    <section class="about-preview section content-section" id="about" data-formation="tornado">
      <div class="about-space" aria-hidden="true"></div>
      <div class="section-copy reveal"><h2 lang="en">A little about me</h2><p>${t(copy.aboutIntro)}</p><div class="actions">${routeLink('/about', t(copy.readStory), 'button button-ocean')}${cvLink()}</div></div>
    </section>
    <section class="projects-preview section content-section" id="projects">
      <div class="featured-projects-heading reveal"><h2 id="projects-heading" lang="en">${escape(copy.projectsFirst)} <em>${escape(copy.projectsSecond)}</em></h2><p>${t(copy.projectsIntro)}</p></div>
      <div class="featured-projects-panel reveal" role="region" aria-labelledby="projects-heading" tabindex="0">
        <ol class="featured-projects-list">${projects.map(featuredProjectRow).join('')}</ol>
      </div>
    </section>
    <section class="bridge section" id="curiosity" data-formation="vortex">
      <div class="bridge-copy">${heading(copy.bridgeFirst, copy.bridgeSecond)}</div>
    </section>
    <section class="journal-preview journal-map-section section content-section" id="journal">
      <div class="journal-map-heading reveal">${heading(copy.journalFirst, copy.journalSecond)}<p>${t(journalMapCopy.intro)}</p></div>
      ${learningMap(language)}
      <div class="journal-map-footer"><p class="journal-map-hint"><span class="map-mouse-hint">${t(journalMapCopy.hint)}</span><span class="map-touch-hint">${t(journalMapCopy.touchHint)}</span></p>${routeLink('/journal', t(copy.allNotes), 'button button-ocean')}</div>
    </section>
    <section class="contact-section section" id="contact" data-formation="corridor">
      <div class="contact-copy bridge-copy">${heading(copy.contactFirst, copy.contactSecond)}<p>${t(copy.contactText)}</p>
      <div class="contact-links">${contactLinks()}</div></div>${footer()}
    </section>`;
}
function contactLinks() {
  const links = [];
  if (profile.email) links.push(`<a class="text-link" href="mailto:${escape(profile.email)}">${t(copy.email)}</a>`);
  if (profile.github) links.push(`<a class="text-link" href="${escape(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>`);
  if (profile.linkedin) links.push(`<a class="text-link" href="${escape(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`);
  return links.length ? links.join('') : `<p class="pending-contact">${t(copy.contactPending)}</p>`;
}
function pageShell(content: string, backTo = '/', backSection?: string) {
  const back = backSection ? sectionLink(backSection, t(words('Kembali ke proyek', 'Back to projects')), 'back-link', 'back') : `<a class="back-link" href="${href(backTo)}" data-route="${backTo}">${arrow('back')}<span>${t(backTo === '/' ? copy.backHome : copy.back)}</span></a>`;
  return `<div class="inner-page section${backSection === 'projects' ? ' project-page' : ''}">${back}${content}${footer()}</div>`;
}
function aboutPage() {
  return pageShell(`
    <div class="page-heading"><h1 lang="en">About me</h1></div>
    <div class="about-layout">
      <div class="portrait-placeholder" aria-label="${t(words('Tempat foto profil', 'Profile image placeholder'))}"><span>Y</span><p>Yanndain</p></div>
      <div class="about-story"><h2>${escape(profile.name)}</h2><p class="profile-handle">@yanndain</p>
      <p>${t(copy.aboutStory)}</p>
      <h3 lang="en">Current focus.</h3><p>${t(copy.focusText)}</p>
      <div class="actions">${cvLink()}${sectionLink('projects', t(copy.viewProjects), 'button button-ocean', null)}</div></div>
    </div>`);
}
function journalPage() {
  return pageShell(`<div class="page-heading">${heading(copy.journalFirst, copy.journalSecond, 'h1')}<p>${t(copy.articlePreviewNotice)}</p></div><div class="journal-list">${journalCard()}</div>`);
}
function detailPage(kind: 'project' | 'article', slug: string) {
  const item = kind === 'project' ? projects.find(project => project.slug === slug) : slug === article.slug ? article : undefined;
  if (!item) return notFound();
  if (kind === 'project') {
    const project = item as Project;
    return pageShell(`<article class="project-detail">
      <header class="project-intro">
        <p class="project-category" lang="en">${escape(project.category)}</p>
        <h1 lang="en">${escape(project.title)}</h1>
        <div class="project-summary"><p>${t(project.description)}</p><span class="preview-badge">${t(copy.preview)}</span></div>
      </header>
      <div class="article-body">${project.sections.map((section, i) => `<section id="part-${i}"><h2 lang="en">${escape(section.title)}</h2><p>${t(section.description)}</p></section>`).join('')}</div>
      <div class="detail-bottom">${sectionLink('projects', t(copy.nextProject), 'button button-ocean', null)}</div>
    </article>`, '/', 'projects');
  }
  const parent = '/journal';
  return pageShell(`<article>
    <div class="detail-heading"><span class="preview-badge">${t(copy.preview)}</span><h1 lang="en">${escape(item.title)}</h1><p>${t(item.description)}</p></div>
    <div class="content-notice">${t(copy.previewNotice)}</div>
    <div class="article-layout"><aside class="table-of-contents"><h2 lang="en">${copy.contents}</h2>${item.sections.map((section, i) => `<a href="#part-${i}" data-jump="part-${i}">${escape(section.title)}</a>`).join('')}</aside>
    <div class="article-body">${item.sections.map((section, i) => `<section id="part-${i}"><h2 lang="en">${escape(section.title)}</h2><p>${t(section.description)}</p></section>`).join('')}</div></div>
    <div class="detail-bottom">${routeLink(parent, t(copy.nextArticle), 'button button-outline')}</div>
  </article>`, parent);
}
function notFound() { return pageShell(`<div class="page-heading"><h1 lang="en">${copy.notFound}</h1>${routeLink('/', t(copy.backHome), 'button button-light')}</div>`); }

function parseLocation() {
  const source = portable ? location.hash.slice(1) : location.pathname;
  const pathname = source.split('?')[0].replace(/\/+$/, '') || '/';
  const match = pathname.match(/^\/(id|en)(\/.*)?$/);
  if (match) { language = match[1] as Language; route = match[2] || '/'; }
  else { route = pathname === '/' || pathname.endsWith('index.html') ? '/' : pathname; }
  // Old project-index bookmarks now open the Home project collection.
  if (route === '/projects') { route = '/'; writeLocation(sectionHref('projects'), true); }
}
function refreshChrome() {
  document.documentElement.lang = language;
  document.documentElement.dataset.page = route === '/' ? 'home' : route.split('/')[1];
  document.title = `Yanndain — ${route === '/' ? `${copy.heroFirst} ${copy.heroSecond}` : (copy[route.split('/')[1] as 'about' | 'projects' | 'journal'] || copy.home).en}`;
  storage.set('yanndain-language', language);
  $('.skip-link').textContent = t(copy.skip);
  $('.brand').setAttribute('href', href('/'));
  $('.brand').setAttribute('aria-label', `${profile.name} — ${t(copy.home)}`);
  $('.brand span').textContent = profile.name;
  $('.menu-toggle').setAttribute('aria-label', t(copy.openMenu));
  $('.menu-close').setAttribute('aria-label', t(copy.closeMenu));
  $('#menu-title').textContent = copy.menu.en;
  $('#menu-title').setAttribute('lang', 'en');
  $('.menu-links').innerHTML = [
    ['/', copy.home], ['/about', copy.about], ['/projects', copy.projects], ['/journal', copy.journal],
  ].map(([path, label]) => {
    if (path === '/projects') return sectionLink('projects', t(label as Localized), '', null);
    const current = route === path;
    return `<a href="${href(path as string)}" data-route="${path}" ${current ? 'aria-current="page"' : ''}><span>${t(label as Localized)}</span></a>`;
  }).join('') + sectionLink('contact', t(copy.contact));
  $$<HTMLButtonElement>('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  const touch = matchMedia('(hover: none)').matches;
  $('.menu-experience').innerHTML = `<button type="button" class="button button-ocean explore-launch" ${document.documentElement.dataset.scene === 'ready' ? '' : 'hidden'}><span lang="en">${interactionCopy.explore}</span><small>${t(interactionCopy.exploreDescription)}</small></button>`;
  $('.interaction-help').innerHTML = `<summary>${t(interactionCopy.help)}</summary><p>${t(interactionCopy.helpIntro)}</p><ul>
    <li>${t(touch ? interactionCopy.mapNodesTouch : interactionCopy.mapNodes)}</li><li>${t(touch ? interactionCopy.mapRouteTouch : interactionCopy.mapRoute)}</li>
    <li>${t(interactionCopy.mapNodesKeyboard)}</li><li>${t(interactionCopy.mapRouteKeyboard)}</li><li>${t(interactionCopy.projectPreview)}</li>
    <li class="water-help">${t(touch ? interactionCopy.oceanTouch : interactionCopy.ocean)}</li></ul><button type="button" class="text-link replay-hints">${t(interactionCopy.replay)}</button>`;
  refreshMotion();
}
function render() {
  pageTransition?.cancel();
  if (projectPreviews) projectPosition = projectPreviews.save();
  projectPreviews?.dispose();
  revealObserver?.disconnect();
  disposeLearningMap?.();
  refreshChrome();
  const parts = route.split('/').filter(Boolean);
  main.innerHTML = route === '/' ? home() : route === '/about' ? aboutPage()
    : route === '/journal' ? journalPage() : parts[0] === 'projects' && parts.length === 2 ? detailPage('project', parts[1])
    : parts[0] === 'journal' && parts.length === 2 ? detailPage('article', parts[1]) : notFound();
  disposeLearningMap = mountLearningMap(document.querySelector('.learning-map'));
  projectPreviews = mountProjectPreviews(document.querySelector('.featured-projects-panel'), projectPosition);
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver?.unobserve(entry.target); }
  }), { threshold: 0.08 });
  $$('.reveal').forEach(element => reduced ? element.classList.add('is-visible') : revealObserver!.observe(element));
  updateScene();
  discovery.refresh();
}
function animatePage() {
  if (reduced) return;
  pageTransition?.cancel();
  pageTransition = main.animate([{ opacity: .25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.7,.3,1)' });
}
function navigate(path: string, options: { lang?: Language; section?: string; preserve?: boolean; replace?: boolean } = {}) {
  explorer.close();
  if (path === '/projects') { path = '/'; options = { ...options, section: 'projects' }; }
  const oldScroll = window.scrollY;
  if (route === '/') savedHomeScroll = oldScroll;
  const oldRoute = route;
  route = path;
  if (options.lang) language = options.lang;
  let url = href(path);
  if (options.section) url += portable ? `?section=${options.section}` : `#${options.section}`;
  writeLocation(url, options.replace);
  menu.close();
  render();
  const token = ++navigationToken;
  requestAnimationFrame(() => {
    if (token !== navigationToken) return;
    if (options.section) document.getElementById(options.section)?.scrollIntoView({ behavior: oldRoute === '/' && !reduced ? 'smooth' : 'instant' });
    else window.scrollTo({ top: options.preserve ? oldScroll : path === '/' && oldRoute !== '/' ? savedHomeScroll : 0, behavior: 'instant' });
    main.focus({ preventScroll: true });
    updateScene();
    if (oldRoute !== route) animatePage();
  });
}
function onHistory() {
  explorer.close();
  menu.close();
  parseLocation();
  render();
  requestAnimationFrame(() => {
    const section = portable ? new URLSearchParams(location.hash.split('?')[1] || '').get('section') : location.hash.slice(1);
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'instant' });
    updateScene();
    animatePage();
  });
}
window.addEventListener('popstate', onHistory);
document.addEventListener('click', event => {
  const target = event.target as Element;
  const link = target.closest<HTMLAnchorElement>('a[data-route], a[data-section], a[data-jump]');
  if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
    event.preventDefault();
    if (link.dataset.jump) document.getElementById(link.dataset.jump)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    else if (link.dataset.section && route === '/') {
      menu.close();
      document.getElementById(link.dataset.section)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    } else navigate(link.dataset.route || '/', { section: link.dataset.section });
  }

});
$$<HTMLButtonElement>('[data-language]').forEach(button => button.addEventListener('click', () => navigate(route, { lang: button.dataset.language as Language, preserve: true, replace: true })));
$('.menu-toggle').addEventListener('click', () => {
  ocean?.clearPointer();
  menu.showModal();
  document.body.classList.add('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', 'true');
});
$('.menu-close').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  document.body.classList.remove('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
});
menu.addEventListener('click', event => {
  if ((event.target as Element).closest('.explore-launch')) {
    menu.close(); explorer.open($('.menu-toggle'), event.detail === 0); return;
  }
  if ((event.target as Element).closest('.replay-hints')) {
    menu.close(); discovery.replay(); return;
  }
  const bounds = menu.getBoundingClientRect();
  if (event.target === menu && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) menu.close();
});
function refreshMotion() {
  document.documentElement.classList.toggle('reduced-motion', reduced);
  const button = $('.motion-toggle');
  button.textContent = t(reduced ? copy.enableMotion : copy.reduceMotion);
  button.setAttribute('aria-pressed', String(reduced));
}
function setMotion(value: boolean) {
  reduced = value;
  refreshMotion();
  ocean?.setReducedMotion(value);
  if (value) pageTransition?.cancel();
  if (value) $$('.reveal').forEach(element => element.classList.add('is-visible'));
  updateScene();
}
$('.motion-toggle').addEventListener('click', () => {
  setMotion(!reduced);
  storage.set('yanndain-motion', reduced ? 'reduced' : 'full');
});
media.addEventListener('change', event => { if (!storage.get('yanndain-motion')) setMotion(event.matches); });

const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
function formation(id: string) {
  const element = document.getElementById(id);
  if (!element) return { amount: 0, phase: 0, y: 0 };
  const rect = element.getBoundingClientRect();
  const phase = clamp((window.innerHeight * 0.5 - rect.top) / rect.height);
  const rise = clamp(phase / 0.34);
  const fall = clamp((1 - phase) / 0.3);
  const amount = Math.min(rise * rise * (3 - 2 * rise), fall * fall * (3 - 2 * fall));
  const center = rect.top + rect.height * 0.5;
  const y = 1 - center / window.innerHeight * 2;
  const copyElement = element.querySelector<HTMLElement>('.bridge-copy');
  if (copyElement) {
    copyElement.style.opacity = `${reduced ? 1 : clamp(amount * 1.35)}`;
    copyElement.style.transform = reduced ? '' : `translateY(${(1 - amount) * 18}px)`;
  }
  return { amount, phase, y };
}
function updateScene() {
  queued = false;
  $('.site-header').classList.toggle('scrolled', window.scrollY > 40);
  const isHome = route === '/' && !explorer.active;
  const depth = explorer.active ? .22 : isHome ? clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) : route.startsWith('/journal') ? 0.72 : route.startsWith('/projects') ? 0.45 : 0.22;
  const vortex = isHome ? formation('curiosity') : { amount: 0, phase: 0, y: 0 };
  const tornado = isHome ? formation('about') : { amount: 0, phase: 0, y: 0 };
  const tornadoSpace = isHome ? document.querySelector('.about-space')?.getBoundingClientRect() : undefined;
  const tornadoY = tornadoSpace ? 1 - (tornadoSpace.top + tornadoSpace.height / 2) / innerHeight * 2 : 0;
  const corridor = isHome ? formation('contact') : { amount: 0, phase: 0, y: 0 };
  const state: OceanState = { depth, tornado: tornado.amount, tornadoY, vortex: vortex.amount, vortexPhase: vortex.phase, vortexY: vortex.y, corridor: corridor.amount, corridorPhase: corridor.phase, corridorY: corridor.y, reading: !isHome && !explorer.active };
  ocean?.setState(state);
  document.documentElement.style.setProperty('--depth', String(depth));
  document.documentElement.style.setProperty('--formation', String(Math.max(vortex.amount, corridor.amount)));
  document.documentElement.dataset.formation = tornado.amount > 0.8 ? 'tornado' : vortex.amount > 0.8 ? 'vortex' : corridor.amount > 0.8 ? 'corridor' : 'free';
}
function queueScroll() { if (!queued) { queued = true; requestAnimationFrame(updateScene); } }
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
parseLocation();
document.documentElement.classList.add('js');
writeLocation(href(route) + (portable ? (location.hash.includes('?') ? `?${location.hash.split('?')[1]}` : '') : location.hash), true);
render();
requestAnimationFrame(() => {
  const section = portable ? new URLSearchParams(location.hash.split('?')[1] || '').get('section') : location.hash.slice(1);
  if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'instant' });
});
import('../ocean/scene').then(({ mountOcean }) => {
  ocean = mountOcean($<HTMLCanvasElement>('#ocean'));
  ocean.setReducedMotion(reduced);
  document.documentElement.dataset.scene = 'ready';
  $('.explore-launch').hidden = false;
  updateScene();
}).catch(error => {
  document.documentElement.dataset.scene = 'fallback';
  console.warn('The 3D ocean is unavailable; the readable static experience is active.', error instanceof Error ? error.message : '');
});
if (import.meta.hot) import.meta.hot.dispose(() => { explorer.dispose(); discovery.dispose(); disposeOceanInput(); projectPreviews?.dispose(); pageTransition?.cancel(); ocean?.dispose(); revealObserver?.disconnect(); disposeLearningMap?.(); disposeWaterFeedback(); });
