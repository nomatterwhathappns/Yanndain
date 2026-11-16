import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('ocean has the agreed 900 fish, working WebGL, and no decorative labels', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready');
  await expect(page.locator('#ocean')).toHaveAttribute('data-fish-count', '900');
  const counts = JSON.parse((await page.locator('#ocean').getAttribute('data-fish-population'))!);
  expect(counts).toEqual({ sardine: 700, jack: 120, reef: 50, lantern: 24, manta: 2, large: 4 });
  await expect(page.locator('.site-header nav')).toHaveCount(0);
  await expect(page.locator('.depth-rail, .specimen-label, .section-kicker, .hero-coordinates')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Professional Security Engineer.');
  await expect(page.locator('.cv-link')).toHaveCount(0);
  const headings = await page.locator('h1,h2,h3').allTextContents();
  const description = await page.locator('.hero-description').textContent();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  expect(await page.locator('h1,h2,h3').allTextContents()).toEqual(headings);
  expect(await page.locator('.hero-description').textContent()).not.toBe(description);
  await expect(page.locator('h1')).toHaveAttribute('lang', 'en');

  expect(errors).toEqual([]);
});

test('section buttons open real pages, localized detail routes survive reload and back', async ({ page }) => {
  // Reload initializes WebGL again on the test runner's software renderer.
  test.setTimeout(60_000);
  await page.goto('/id');
  await page.getByRole('link', { name: 'Kenali lebih dekat' }).click();
  await expect(page).toHaveURL(/\/id\/about$/);
  await expect(page.locator('.about-story')).toContainText('Ryanda Fajr Abdilah');
  await expect(page.locator('.page-heading h1')).toHaveText('About me');
  await expect(page.locator('.page-heading>p')).toHaveCount(0);
  await page.getByRole('link', { name: 'Lihat proyek', exact: true }).click();
  await expect(page).toHaveURL(/\/id#projects$/);
  await expect(page.locator('.featured-projects-panel')).toBeInViewport();
  await page.locator('.featured-project-link').nth(1).click();
  await expect(page).toHaveURL(/\/id\/projects\/ci-cd-pipeline-security-auditor$/);
  await expect(page.locator('.project-summary .preview-badge')).toHaveCount(0);
  const detailHeadings = await page.locator('h1,h2,h3').allTextContents();
  const detailBody = await page.locator('.article-body').textContent();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  expect(await page.locator('h1,h2,h3').allTextContents()).toEqual(detailHeadings);
  expect(await page.locator('.article-body').textContent()).not.toBe(detailBody);
  await expect(page).toHaveURL(/\/en\/projects\/ci-cd-pipeline-security-auditor$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('CI/CD Pipeline Security Auditor');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('CI/CD Pipeline Security Auditor');
  await page.goBack();
  await expect(page).toHaveURL(/\/id#projects$/);
  await expect(page.locator('.featured-project-link')).toHaveCount(4);
});

test('vortex reverses with scrolling and the final contact section inherits the corridor effects', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/id');
  // Software WebGL needs extra time to compile shaders on a fresh browser.
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready', { timeout: 60_000 });
  async function center(id: string) {
    await page.locator(`#${id}`).evaluate(async el => {
      scrollTo({ top: el.getBoundingClientRect().top + scrollY + el.getBoundingClientRect().height / 2 - innerHeight / 2, behavior: 'instant' });
      // Allow the scroll event and its scheduled frame before the next jump.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  }
  await center('about');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'tornado');
  await center('projects');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'free');
  await center('about');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'tornado');
  await center('curiosity');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'vortex');
  await expect(page.locator('#curiosity h2')).toBeInViewport();
  await center('journal');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'free');
  await center('curiosity');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'vortex');
  await expect(page.locator('#horizon')).toHaveCount(0);
  await expect(page.locator('#journal + #contact')).toHaveCount(1);
  await center('contact');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'corridor');
  await expect(page.locator('#contact h2')).toBeInViewport();
  await expect(page.locator('#contact .bridge-copy')).toHaveCSS('opacity', '1');
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'corridor');
  await expect(page.locator('#contact footer')).toBeInViewport();
  await center('journal');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'free');
  await page.setViewportSize({ width: 390, height: 844 });
  await center('contact');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'corridor');
  await expect(page.locator('#contact h2')).toBeInViewport();
  await expect(page.locator('#contact .bridge-copy')).toHaveCSS('opacity', '1');
  await center('journal');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'free');
  await center('contact');
  await expect(page.locator('html')).toHaveAttribute('data-formation', 'corridor');
  await expect(page.locator('#ocean')).toHaveAttribute('data-fish-count', '900');
});

test('mobile menu, keyboard dismissal, journal pages, contact and motion preferences work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Buka menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.locator('.menu-links').getByRole('link', { name: 'Jurnal' }).click();
  await expect(page).toHaveURL(/\/id\/journal$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.locator('.journal-card').click();
  await expect(page).toHaveURL(/\/id\/journal\/finding-my-way-into-security$/);
  await expect(page.locator('.article-body section')).toHaveCount(6);
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.getByRole('button', { name: 'Aktifkan animasi' }).click();
  await expect(page.locator('html')).not.toHaveClass(/reduced-motion/);
  await page.getByRole('button', { name: 'Kurangi animasi' }).click();
  await page.locator('.menu-links').getByRole('link', { name: 'Kontak' }).click();
  await expect(page.locator('#contact h2')).toBeInViewport();
  const contacts = [
    { name: 'GitHub', url: 'https://github.com/nomatterwhathappns' },
    { name: 'Instagram', url: 'https://www.instagram.com/ryanndafajr?cplk=MWd4dzBndTd1ZjBoMg==' },
  ];
  for (const contact of contacts) {
    const link = page.locator('.contact-links').getByRole('link', { name: contact.name, exact: true });
    await expect(link).toHaveAttribute('href', contact.url);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
  }
  await expect(page.locator('.contact-links .pending-contact')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/reduced-motion/);
  await expect(page.locator('#ocean')).toHaveAttribute('data-fish-count', '900');
});

test('fish, manta and sharks travel without scrolling or pointer input', async ({ page }) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Observe actual instance transforms sent to WebGL, without adding a debug API
  // to the application. Water movement alone cannot make this check pass.
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.bufferSubData;
    const frames: Record<string, { first: number[]; last: number[] }> = {};
    (window as any).__fishFrames = frames;
    WebGL2RenderingContext.prototype.bufferSubData = function (...args: any[]) {
      const data = args[2];
      if (args[0] === this.ARRAY_BUFFER && data instanceof Float32Array && [11200, 32, 64].includes(data.length)) {
        const position = Array.from(data.slice(12, 15));
        const key = String(data.length);
        if (!frames[key]) frames[key] = { first: position, last: position };
        frames[key].last = position;
      }
      return original.apply(this, args as any);
    };
  });
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready');
  await expect.poll(async () => page.evaluate(() => {
    const frames = (window as any).__fishFrames;
    return [11200, 32, 64].every(size => {
      const f = frames[String(size)];
      return f && Math.hypot(...f.last.map((v: number, i: number) => v - f.first[i])) > .6;
    });
  }), { timeout: 20_000 }).toBeTruthy();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('without WebGL, content and route navigation remain usable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'fallback');
  await page.locator('.featured-project-link').first().click();
  await expect(page).toHaveURL(/\/id\/projects\/studyos$/);
  await expect(page.locator('.article-body')).toBeVisible();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('StudyOS');
});

test('retired project index redirects home and detail navigation returns to the collection', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  for (const language of ['id', 'en']) {
    await page.goto(`/${language}/projects`);
    await expect(page).toHaveURL(new RegExp(`/${language}#projects$`));
    await expect(page.locator('.featured-projects-panel')).toBeInViewport();
    await expect(page.locator('.filters, .project-card')).toHaveCount(0);
    await page.locator('.featured-project-link').first().click();
    await expect(page.locator('.project-detail .article-body')).toBeVisible();
    await expect(page.locator('.project-detail .table-of-contents, .project-detail .content-notice')).toHaveCount(0);
    await page.locator('.back-link').click();
    await expect(page.locator('.featured-projects-panel')).toBeInViewport();
    await page.locator('.featured-project-link').last().click();
    await page.locator('.detail-bottom [data-section="projects"]').click();
    await expect(page.locator('.featured-projects-panel')).toBeInViewport();
    await page.locator('.brand').click();
    await page.locator('.menu-toggle').click();
    await page.locator('.menu-links [data-section="projects"]').click();
    await expect(page.locator('.featured-projects-panel')).toBeInViewport();
  }

  const html = await readFile('yanndain-preview.html', 'utf8');
  await page.route('**/portable-projects', request => request.fulfill({ contentType: 'text/html', body: html }));
  await page.goto('/portable-projects#/en/projects');
  await expect(page).toHaveURL(/#\/en\?section=projects$/);
  await expect(page.locator('.featured-projects-panel')).toBeInViewport();
  await page.locator('.featured-project-link').first().click();
  await expect(page).toHaveURL(/#\/en\/projects\/studyos$/);
  await page.reload();
  await expect(page.locator('.project-detail')).toBeVisible();
  await page.locator('.back-link').click();
  await expect(page).toHaveURL(/#\/en\?section=projects$/);
});

test('standalone preview runs without external resources and supports deep navigation', async ({ page }) => {
  // Includes two complete boots of the inlined application with software WebGL.
  test.setTimeout(60_000);
  const html = await readFile('yanndain-preview.html', 'utf8');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const unexpectedRequests: string[] = [];
  await page.route('**/*', async route => {
    if (route.request().isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: html });
    unexpectedRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('http://127.0.0.1:5173/portable-check');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready');
  await expect(page.locator('html')).toHaveAttribute('data-portable', 'true');
  await page.getByRole('link', { name: 'Baca perjalanan saya' }).click();
  await expect(page).toHaveURL(/#\/id\/journal\/finding-my-way-into-security$/);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/#\/en\/journal\/finding-my-way-into-security$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Finding my way into security.');
  expect(unexpectedRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('standalone preview also runs inside an opaque sandboxed iframe', async ({ page }) => {
  const html = await readFile('yanndain-preview.html', 'utf8');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('about:blank');
  await page.evaluate(content => {
    document.body.replaceChildren();
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.style.cssText = 'width:100vw;height:100vh;border:0';
    frame.srcdoc = content;
    document.body.append(frame);
  }, html);
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('h1')).toContainText('Professional Security Engineer.');
  await frame.locator('.featured-project-link').first().click();
  await expect(frame.locator('.article-body')).toBeVisible();
  await frame.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(frame.locator('html')).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});
