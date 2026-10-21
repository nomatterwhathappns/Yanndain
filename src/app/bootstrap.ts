import '@fontsource-variable/manrope';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '../styles/main.css';
import { article, copy, local, profile, projects, words, type Language, type Localized, type Project } from '../content';
import type { OceanControls, OceanState } from '../ocean/scene';

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
let queued = false;
let savedHomeScroll = 0;
let navigationToken = 0;
const main = $('#content');
const menu = $<HTMLDialogElement>('#site-menu');
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
function arrow(direction: 'right' | 'down' | 'up' | 'back' = 'right') {
  const paths = { right: 'M5 19 19 5M7 5h12v12', down: 'M12 4v16m-6-6 6 6 6-6', up: 'M12 20V4m-6 6 6-6 6 6', back: 'M20 12H4m6-6-6 6 6 6' };
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${paths[direction]}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function routeLink(path: string, text: string, className = 'text-link') {
  return `<a class="${className}" href="${href(path)}" data-route="${path}"><span>${text}</span>${arrow()}</a>`;
}
function sectionLink(section: string, text: string, className = 'text-link', direction: 'down' | 'up' = 'down') {
  const url = portable ? `${href('/')}?section=${section}` : `${href('/')}#${section}`;
  return `<a class="${className}" href="${url}" data-section="${section}"><span>${text}</span>${arrow(direction)}</a>`;
}
function cvLink() {
  const url = profile.cv[language] || profile.cv.en || profile.cv.id;
  return url ? `<a class="text-link cv-link" href="${escape(url)}" target="_blank" rel="noopener noreferrer"><span>${t(copy.viewCV)}</span>${arrow()}</a>` : '';
}
function heading(first: string, second: string, tag = 'h2') {
  return `<${tag} lang="en">${escape(first)}<br><em>${escape(second)}</em></${tag}>`;
}
function art(type: Project['art']) {
  // Scenic placeholders, not fabricated screenshots of completed work.
  const paths = {
    lab: '<path d="M0 280 45 205 86 228 134 165 171 228 206 204 250 269 300 235 355 190 400 225v75H0Z" fill="#071f2b"/><path d="m0 300 87-45 70 22 92-38 76 43 75-25v43" fill="#0b2f39"/>',
    signal: '<path d="M0 250Q80 125 160 230T400 210v90H0Z" fill="#0a2635"/><path d="M0 285Q100 220 205 268T400 240v60H0Z" fill="#0b3340"/>',
    flow: '<path d="M0 300V80l40 27 15 70 65 23 34 100M400 300V60l-50 35-22 73-60 65-15 67" fill="#0a2430"/><path d="M0 300V140l38 67 50 35 27 58M400 300V160l-63 65-22 75" fill="#10303a"/>',
  };
  return `<div class="project-art art-${type}" aria-hidden="true"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">${paths[type]}</svg><span class="art-light"></span></div>`;
}
function projectCard(project: Project) {
  return `<a class="project-card reveal" data-category="${project.category}" href="${href(`/projects/${project.slug}`)}" data-route="/projects/${project.slug}">
    ${art(project.art)}
    <div class="project-meta"><span>${project.category}</span><span class="preview-badge">${t(copy.preview)}</span></div>
    <div class="project-name"><h3 lang="en">${escape(project.title)}</h3>${arrow()}</div><p>${t(project.description)}</p>
  </a>`;
}
function journalCard() {
  return `<a class="journal-card reveal" href="${href(`/journal/${article.slug}`)}" data-route="/journal/${article.slug}">
    <div class="journal-art" aria-hidden="true"><div class="journal-light"></div><div class="journal-water"></div></div>
    <div class="journal-card-copy"><span class="preview-badge">${t(copy.preview)}</span><h3 lang="en">${escape(article.title)}</h3><p>${t(article.description)}</p><span class="journal-arrow">${arrow()}</span></div>
  </a>`;
}
function footer() {
  return `<footer><a href="${href('/')}" data-route="/" class="footer-brand">yanndain.</a>${sectionLink('surface', t(copy.surface), 'text-link', 'up')}</footer>`;
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
    <section class="about-preview section content-section" id="about">
      <div class="about-space" aria-hidden="true"></div>
      <div class="section-copy reveal">${heading(copy.aboutFirst, copy.aboutSecond)}<p>${t(copy.aboutIntro)}</p><div class="actions">${routeLink('/about', t(copy.readStory))}${cvLink()}</div></div>
    </section>
    <section class="projects-preview section content-section" id="projects">
      <div class="section-heading reveal">${heading(copy.projectsFirst, copy.projectsSecond)}<p>${t(copy.projectsIntro)}</p></div>
      <div class="project-grid">${projects.map(projectCard).join('')}</div>
      <div class="section-actions reveal">${routeLink('/projects', t(copy.allProjects), 'button button-outline')}</div>
    </section>
    <section class="bridge section" id="curiosity" data-formation="vortex">
      <div class="bridge-copy">${heading(copy.bridgeFirst, copy.bridgeSecond)}</div>
    </section>
    <section class="journal-preview section content-section" id="journal">
      <div class="section-copy reveal">${heading(copy.journalFirst, copy.journalSecond)}<p>${t(copy.journalIntro)}</p>${routeLink('/journal', t(copy.allNotes), 'button button-outline')}</div>
      ${journalCard()}
    </section>
    <section class="current-focus section content-section" id="focus"><div class="focus-layout reveal">${heading(copy.focusFirst, copy.focusSecond)}<p>${t(copy.focusText)}</p></div></section>
    <section class="bridge horizon section" id="horizon" data-formation="corridor"><div class="bridge-copy">${heading(copy.horizonFirst, copy.horizonSecond)}</div></section>
    <section class="contact-section section" id="contact">
      <div class="contact-copy reveal">${heading(copy.contactFirst, copy.contactSecond)}<p>${t(copy.contactText)}</p>
      <div class="contact-links">${contactLinks()}</div></div>${footer()}
    </section>`;
}
function contactLinks() {
  const links = [];
  if (profile.email) links.push(`<a class="text-link" href="mailto:${escape(profile.email)}">${t(copy.email)}${arrow()}</a>`);
  if (profile.github) links.push(`<a class="text-link" href="${escape(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub${arrow()}</a>`);
  if (profile.linkedin) links.push(`<a class="text-link" href="${escape(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn${arrow()}</a>`);
  return links.length ? links.join('') : `<p class="pending-contact">${t(copy.contactPending)}</p>`;
}
function pageShell(content: string, backTo = '/') {
  return `<div class="inner-page section"><a class="back-link" href="${href(backTo)}" data-route="${backTo}">${arrow('back')}<span>${t(backTo === '/' ? copy.backHome : copy.back)}</span></a>${content}${footer()}</div>`;
}
function aboutPage() {
  return pageShell(`
    <div class="page-heading">${heading(copy.aboutFirst, copy.aboutSecond, 'h1')}<p>${t(copy.aboutIntro)}</p></div>
    <div class="about-layout">
      <div class="portrait-placeholder" aria-label="${t(words('Tempat foto profil', 'Profile image placeholder'))}"><span>Y</span><p>Yanndain</p></div>
      <div class="about-story"><h2>${escape(profile.name)}</h2><p class="profile-handle">@yanndain</p>
      <p>${t(words('Bagian ini disiapkan untuk cerita personal, latar pendidikan, dan perjalanan belajar. Isi profil lengkap akan ditambahkan setelah arah visualnya selesai.', 'This space is ready for a personal story, education, and the learning journey. The complete profile will be added once the visual direction is settled.'))}</p>
      <h3 lang="en">Current focus.</h3><p>${t(copy.focusText)}</p>
      <div class="actions">${cvLink()}${routeLink('/projects', t(copy.allProjects))}</div></div>
    </div>`);
}
function projectsPage() {
  return pageShell(`<div class="page-heading">${heading(copy.projectsFirst, copy.projectsSecond, 'h1')}<p>${t(copy.projectPreviewNotice)}</p></div>
    <div class="filters" role="group" aria-label="${t(words('Kategori proyek', 'Project categories'))}">
      ${['all', 'Security Engineering', 'Detection', 'Automation'].map((category, i) => `<button type="button" data-filter="${category}" aria-pressed="${i === 0}">${category === 'all' ? t(copy.all) : category}</button>`).join('')}
    </div><div class="project-grid">${projects.map(projectCard).join('')}</div>
    <p class="filter-empty" hidden>${t(copy.emptyFilter)}</p>`);
}
function journalPage() {
  return pageShell(`<div class="page-heading">${heading(copy.journalFirst, copy.journalSecond, 'h1')}<p>${t(copy.articlePreviewNotice)}</p></div><div class="journal-list">${journalCard()}</div>`);
}
function detailPage(kind: 'project' | 'article', slug: string) {
  const item = kind === 'project' ? projects.find(project => project.slug === slug) : slug === article.slug ? article : undefined;
  if (!item) return notFound();
  const parent = kind === 'project' ? '/projects' : '/journal';
  return pageShell(`<article>
    <div class="detail-heading"><span class="preview-badge">${t(copy.preview)}</span><h1 lang="en">${escape(item.title)}</h1><p>${t(item.description)}</p></div>
    <div class="content-notice">${t(copy.previewNotice)}</div>
    ${kind === 'project' ? `<div class="detail-art">${art((item as Project).art)}</div>` : ''}
    <div class="article-layout"><aside class="table-of-contents"><h2 lang="en">${copy.contents}</h2>${item.sections.map((section, i) => `<a href="#part-${i}" data-jump="part-${i}">${escape(section.title)}</a>`).join('')}</aside>
    <div class="article-body">${item.sections.map((section, i) => `<section id="part-${i}"><h2 lang="en">${escape(section.title)}</h2><p>${t(section.description)}</p></section>`).join('')}</div></div>
    <div class="detail-bottom">${routeLink(parent, t(kind === 'project' ? copy.nextProject : copy.nextArticle), 'button button-outline')}</div>
  </article>`, parent);
}
function notFound() { return pageShell(`<div class="page-heading"><h1 lang="en">${copy.notFound}</h1>${routeLink('/', t(copy.backHome), 'button button-light')}</div>`); }

function parseLocation() {
  const source = portable ? location.hash.slice(1) : location.pathname;
  const pathname = source.split('?')[0].replace(/\/+$/, '') || '/';
  const match = pathname.match(/^\/(id|en)(\/.*)?$/);
  if (match) { language = match[1] as Language; route = match[2] || '/'; }
  else { route = pathname === '/' || pathname.endsWith('index.html') ? '/' : pathname; }
}
function refreshChrome() {
  document.documentElement.lang = language;
  document.documentElement.dataset.page = route === '/' ? 'home' : route.split('/')[1];
  document.title = `Yanndain — ${route === '/' ? `${copy.heroFirst} ${copy.heroSecond}` : (copy[route.split('/')[1] as 'about' | 'projects' | 'journal'] || copy.home).en}`;
  storage.set('yanndain-language', language);
  $('.skip-link').textContent = t(copy.skip);
  $('.brand').setAttribute('href', href('/'));
  $('.brand').setAttribute('aria-label', `Yanndain — ${t(copy.home)}`);
  $('.menu-toggle').setAttribute('aria-label', t(copy.openMenu));
  $('.menu-close').setAttribute('aria-label', t(copy.closeMenu));
  $('#menu-title').textContent = copy.menu.en;
  $('#menu-title').setAttribute('lang', 'en');
  $('.menu-links').innerHTML = [
    ['/', copy.home], ['/about', copy.about], ['/projects', copy.projects], ['/journal', copy.journal],
  ].map(([path, label]) => {
    const current = route === path;
    return `<a href="${href(path as string)}" data-route="${path}" ${current ? 'aria-current="page"' : ''}><span>${t(label as Localized)}</span>${arrow()}</a>`;
  }).join('') + sectionLink('contact', t(copy.contact));
  $$<HTMLButtonElement>('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  refreshMotion();
}
function render() {
  revealObserver?.disconnect();
  refreshChrome();
  const parts = route.split('/').filter(Boolean);
  main.innerHTML = route === '/' ? home() : route === '/about' ? aboutPage() : route === '/projects' ? projectsPage()
    : route === '/journal' ? journalPage() : parts[0] === 'projects' && parts.length === 2 ? detailPage('project', parts[1])
    : parts[0] === 'journal' && parts.length === 2 ? detailPage('article', parts[1]) : notFound();
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver?.unobserve(entry.target); }
  }), { threshold: 0.08 });
  $$('.reveal').forEach(element => reduced ? element.classList.add('is-visible') : revealObserver!.observe(element));
  updateScene();
}
function navigate(path: string, options: { lang?: Language; section?: string; preserve?: boolean; replace?: boolean } = {}) {
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
  });
}
function onHistory() {
  menu.close();
  parseLocation();
  render();
  requestAnimationFrame(() => {
    const section = portable ? new URLSearchParams(location.hash.split('?')[1] || '').get('section') : location.hash.slice(1);
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'instant' });
    updateScene();
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
  const filter = target.closest<HTMLButtonElement>('[data-filter]');
  if (filter) {
    $$<HTMLButtonElement>('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    $$<HTMLAnchorElement>('.project-card').forEach(card => {
      card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter;
    });
  }
});
$$<HTMLButtonElement>('[data-language]').forEach(button => button.addEventListener('click', () => navigate(route, { lang: button.dataset.language as Language, preserve: true, replace: true })));
$('.menu-toggle').addEventListener('click', () => {
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
  const copyElement = element.querySelector<HTMLElement>('.bridge-copy')!;
  copyElement.style.opacity = `${reduced ? 1 : clamp(amount * 1.35)}`;
  copyElement.style.transform = reduced ? '' : `translateY(${(1 - amount) * 18}px)`;
  return { amount, phase, y };
}
function updateScene() {
  queued = false;
  $('.site-header').classList.toggle('scrolled', window.scrollY > 40);
  const isHome = route === '/';
  const depth = isHome ? clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) : route.startsWith('/journal') ? 0.72 : route.startsWith('/projects') ? 0.45 : 0.22;
  const vortex = isHome ? formation('curiosity') : { amount: 0, phase: 0, y: 0 };
  const corridor = isHome ? formation('horizon') : { amount: 0, phase: 0, y: 0 };
  const state: OceanState = { depth, vortex: vortex.amount, vortexPhase: vortex.phase, vortexY: vortex.y, corridor: corridor.amount, corridorPhase: corridor.phase, corridorY: corridor.y, reading: !isHome };
  ocean?.setState(state);
  document.documentElement.style.setProperty('--depth', String(depth));
  document.documentElement.style.setProperty('--formation', String(Math.max(vortex.amount, corridor.amount)));
  document.documentElement.dataset.formation = vortex.amount > 0.8 ? 'vortex' : corridor.amount > 0.8 ? 'corridor' : 'free';
}
function queueScroll() { if (!queued) { queued = true; requestAnimationFrame(updateScene); } }
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
window.addEventListener('pointermove', event => {
  if (event.pointerType === 'mouse' && !reduced && !menu.open) ocean?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
}, { passive: true });
document.addEventListener('pointerleave', () => ocean?.setPointer(0, 0));
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
  updateScene();
}).catch(error => {
  document.documentElement.dataset.scene = 'fallback';
  console.warn('The 3D ocean is unavailable; the readable static experience is active.', error instanceof Error ? error.message : '');
});
if (import.meta.hot) import.meta.hot.dispose(() => { ocean?.dispose(); revealObserver?.disconnect(); });
