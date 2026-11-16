import { expect, test, type Locator, type Page } from '@playwright/test';

const stopIds = [
  'first-steps', 'choosing-cyber', 'web-exploration', 'security-class', 'xss-presentation',
  'thm-practice', 'htb-practice', 'portswigger-focus', 'still-exploring',
];
const desktopProgress = [.02, .14, .26, .38, .5, .62, .74, .86, .98];
const mobileProgress = [0, .125, .25, .375, .5, .625, .75, .875, 1];

test.beforeEach(async ({ page }) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Map reading and motion remain independent of the Three.js renderer.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'fallback', { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
});

async function controlledNote(page: Page, node: Locator) {
  const id = await node.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return page.locator(`[id="${id}"]`);
}

async function revealMap(map: Locator) {
  await map.evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 100, behavior: 'instant' }));
  await expect(map).toBeInViewport();
}

async function expectTravelerMoving(traveler: Locator) {
  await expect(traveler).toHaveAttribute('transform', /\S+/);
  const initial = await traveler.getAttribute('transform');
  await expect.poll(() => traveler.getAttribute('transform')).not.toBe(initial);
}

async function expectTravelerStill(traveler: Locator) {
  const positions = await traveler.evaluate(element => new Promise<(string | null)[]>(resolve => {
    const values: (string | null)[] = [];
    let start = 0;
    let settlingFrames = 2;
    function sample(now: number) {
      if (settlingFrames-- > 0) { requestAnimationFrame(sample); return; }
      if (!start) start = now;
      values.push(element.getAttribute('transform'));
      if (now - start >= 400) resolve(values);
      else requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  }));
  expect(positions.length).toBeGreaterThan(1);
  expect(new Set(positions).size).toBe(1);
  expect(positions[0]).toBeTruthy();
}

for (const [width, route, progressValues] of [
  [1440, 'desktop', desktopProgress], [390, 'mobile', mobileProgress], [320, 'mobile', mobileProgress],
] as const) {
  test(`all nine ${route} lights and selection endpoints align to the path at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const map = page.locator('.learning-map');
    const nodes = map.locator('[data-map-node]');
    await expect(nodes).toHaveCount(9);
    expect(await nodes.evaluateAll(elements => elements.map(element => element.getAttribute('data-map-node')))).toEqual(stopIds);
    await revealMap(map);

    for (let index = 0; index < stopIds.length; index++) {
      const node = nodes.nth(index);
      await node.focus();
      await expect(await controlledNote(page, node)).toBeVisible();
      await expect.poll(async () => node.evaluate((element, config) => {
        const map = element.closest('.learning-map')!;
        const stop = element.closest('.map-stop')!;
        const attribute = config.route === 'desktop' ? 'data-route-progress' : 'data-mobile-progress';
        const actualProgress = Number(stop.getAttribute(attribute) ?? element.getAttribute(attribute) ?? 'NaN');
        const path = map.querySelector<SVGPathElement>(`.map-route-${config.route} .map-route-line`)!;
        const selection = map.querySelector<SVGPathElement>(`.map-route-${config.route} .map-route-selection`)!;
        const point = path.getPointAtLength(path.getTotalLength() * config.progress);
        const screen = new DOMPoint(point.x, point.y).matrixTransform(path.getScreenCTM()!);
        const nodeBounds = element.getBoundingClientRect();
        const dotBounds = element.querySelector('.map-node-dot')!.getBoundingClientRect();
        const dash = parseFloat(getComputedStyle(selection).strokeDasharray);
        const normalizedLength = Number(selection.getAttribute('pathLength'));
        const endpoint = selection.getPointAtLength(selection.getTotalLength() * dash / normalizedLength);
        const selectedScreen = new DOMPoint(endpoint.x, endpoint.y).matrixTransform(selection.getScreenCTM()!);
        return Math.max(
          Math.abs(actualProgress - config.progress) * 1000,
          Math.hypot(nodeBounds.x + nodeBounds.width / 2 - screen.x, nodeBounds.y + nodeBounds.height / 2 - screen.y),
          Math.hypot(dotBounds.x + dotBounds.width / 2 - screen.x, dotBounds.y + dotBounds.height / 2 - screen.y),
          Math.hypot(selectedScreen.x - screen.x, selectedScreen.y - screen.y),
        );
      }, { route, progress: progressValues[index] }), { message: `${stopIds[index]} must share the route and highlight endpoint` }).toBeLessThan(1.1);

      // A normalized dash can be geometrically correct but paint short when
      // vector-effect changes its scaling. Check the actual isolated SVG pixels.
      const raster = await node.evaluate(async (element, config) => {
        const route = element.closest('.learning-map')!.querySelector<SVGSVGElement>(`.map-route-${config.route}`)!;
        const selected = route.querySelector<SVGPathElement>('.map-route-selection')!;
        const bounds = route.getBoundingClientRect();
        const computed = getComputedStyle(selected);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', String(bounds.width));
        svg.setAttribute('height', String(bounds.height));
        svg.setAttribute('viewBox', route.getAttribute('viewBox')!);
        svg.setAttribute('preserveAspectRatio', 'none');
        const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        stroke.setAttribute('d', selected.getAttribute('d')!);
        stroke.setAttribute('pathLength', selected.getAttribute('pathLength')!);
        stroke.setAttribute('fill', 'none');
        stroke.setAttribute('stroke', 'red');
        stroke.setAttribute('opacity', '1');
        for (const property of ['stroke-dasharray', 'stroke-dashoffset', 'stroke-width', 'vector-effect', 'stroke-linecap']) {
          stroke.setAttribute(property, computed.getPropertyValue(property));
        }
        svg.append(stroke);
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(bounds.width);
        canvas.height = Math.ceil(bounds.height);
        const context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0, bounds.width, bounds.height);
        const viewBox = route.viewBox.baseVal;
        const redNear = (progress: number) => {
          const point = selected.getPointAtLength(selected.getTotalLength() * progress);
          const x = (point.x - viewBox.x) / viewBox.width * bounds.width;
          const y = (point.y - viewBox.y) / viewBox.height * bounds.height;
          const left = Math.max(0, Math.floor(x - 2));
          const top = Math.max(0, Math.floor(y - 2));
          const right = Math.min(canvas.width, Math.ceil(x + 2));
          const bottom = Math.min(canvas.height, Math.ceil(y + 2));
          const pixels = context.getImageData(left, top, right - left, bottom - top).data;
          for (let row = top; row < bottom; row++) for (let column = left; column < right; column++) {
            if (Math.hypot(column + .5 - x, row + .5 - y) > 2) continue;
            const offset = ((row - top) * (right - left) + column - left) * 4;
            if (pixels[offset] > 200 && pixels[offset + 1] < 50 && pixels[offset + 2] < 50 && pixels[offset + 3] > 20) return true;
          }
          return false;
        };
        return {
          before: config.progress > 0 ? redNear(Math.max(0, config.progress - .006)) : null,
          after: config.progress + .006 <= 1 ? redNear(config.progress + .006) : null,
        };
      }, { route, progress: progressValues[index] });
      if (progressValues[index] > 0) expect(raster.before, `${stopIds[index]} stroke must reach just before its light`).toBe(true);
      if (progressValues[index] + .006 <= 1) expect(raster.after, `${stopIds[index]} stroke must stop before the next path segment`).toBe(false);
    }
  });
}

for (const [width, route] of [[1440, 'desktop'], [390, 'mobile']] as const) {
  test(`the ${route} fish keeps moving while notes are hovered or focused and respects motion settings`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).not.toHaveClass(/reduced-motion/);
    const map = page.locator('.learning-map');
    const first = map.locator('[data-map-node]').first();
    const note = await controlledNote(page, first);
    const traveler = map.locator(`.map-route-${route} .map-traveler`);
    await revealMap(map);
    await expectTravelerMoving(traveler);

    await first.hover();
    await expect(note).toBeVisible();
    await expectTravelerMoving(traveler);
    await note.hover();
    await expect(note).toBeVisible();
    await expectTravelerMoving(traveler);
    await page.keyboard.press('Escape');
    await page.mouse.move(0, 0);
    await first.focus();
    await expect(note).toBeVisible();
    await expectTravelerMoving(traveler);

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(map).not.toBeInViewport();
    await expectTravelerStill(traveler);
    await revealMap(map);
    await expectTravelerMoving(traveler);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveClass(/reduced-motion/);
    await expectTravelerStill(traveler);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).not.toHaveClass(/reduced-motion/);
    await expectTravelerMoving(traveler);
    await page.locator('.menu-toggle').click();
    await page.locator('.motion-toggle').click();
    await expect(page.locator('html')).toHaveClass(/reduced-motion/);
    await page.locator('.menu-close').click();
    await expectTravelerStill(traveler);
  });
}

test('nine concise journey notes support keyboard traversal, wrapping and dismissal', async ({ page }) => {
  const map = page.locator('.learning-map');
  const nodes = map.locator('[data-map-node]');
  await expect(nodes).toHaveCount(9);
  expect(await map.locator('.map-note h3').allTextContents()).toEqual([
    'First steps', 'Choosing cybersecurity', 'Web security basics', 'Structured learning', 'Presenting XSS',
    'TryHackMe practice', 'Hack The Box practice', 'A closer look at SQLi', 'Still exploring',
  ]);
  await nodes.first().focus();
  for (let index = 0; index < stopIds.length; index++) {
    const node = nodes.nth(index);
    await expect(node).toBeFocused();
    await expect(node).toHaveAttribute('aria-expanded', 'true');
    const note = await controlledNote(page, node);
    await expect(note).toBeVisible();
    await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);
    const paragraph = (await note.locator('p').innerText()).trim();
    expect(paragraph.length).toBeGreaterThan(15);
    expect(paragraph.length).toBeLessThanOrEqual(240);
    await page.keyboard.press('ArrowRight');
  }
  await expect(nodes.first()).toBeFocused();
  await page.keyboard.press('End');
  await expect(nodes.last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(nodes.first()).toBeFocused();
  const firstNote = await controlledNote(page, nodes.first());
  await firstNote.getByRole('button', { name: 'Tutup penjelasan' }).click();
  await expect(firstNote).toBeHidden();
  await expect(nodes.first()).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(nodes.last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
});

test('mouse notes close locally and stay readable while the pointer is over them', async ({ page }) => {
  const map = page.locator('.learning-map');
  const first = map.locator('[data-map-node]').first();
  const note = await controlledNote(page, first);
  await first.hover();
  await expect(note).toBeVisible();
  await note.hover();
  await expect(note).toBeVisible();
  const bounds = (await first.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width + 28, bounds.y + bounds.height / 2);
  await expect(note).toBeHidden({ timeout: 700 });
  await expect(map).toBeInViewport();
  await first.click();
  await expect(note).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(note).toBeHidden({ timeout: 700 });
});

test('journey descriptions translate while point titles and article navigation remain usable', async ({ page }) => {
  const nodes = page.locator('#journal [data-map-node]');
  const labels = await nodes.locator('[lang="en"]').allTextContents();
  await nodes.first().focus();
  const idText = await (await controlledNote(page, nodes.first())).innerText();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await nodes.locator('[lang="en"]').allTextContents()).toEqual(labels);
  await nodes.first().focus();
  const note = await controlledNote(page, nodes.first());
  await expect(note).toBeVisible();
  expect(await note.innerText()).not.toBe(idText);
  await page.locator('#journal').getByRole('link', { name: 'Read my journey', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/journal\/finding-my-way-into-security$/);
  await expect(page.locator('.article-body')).toBeVisible();
});

for (const width of [390, 320]) {
  test.describe(`touch journey at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });
    test('all nine short notes fit, select individually and close by toggle or button', async ({ page }) => {
      const map = page.locator('.learning-map');
      const nodes = map.locator('[data-map-node]');
      await expect(nodes).toHaveCount(9);
      for (const node of await nodes.all()) {
        await node.tap();
        await expect(node).toHaveAttribute('aria-expanded', 'true');
        await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);
        const note = await controlledNote(page, node);
        const bounds = await note.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
        expect((await note.locator('p').innerText()).length).toBeLessThanOrEqual(240);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await nodes.last().tap();
      await expect(nodes.last()).toHaveAttribute('aria-expanded', 'false');
      await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
      await nodes.last().tap();
      const lastNote = await controlledNote(page, nodes.last());
      await lastNote.getByRole('button', { name: 'Tutup penjelasan' }).tap();
      await expect(lastNote).toBeHidden();
      await expect(nodes.last()).toBeFocused();
    });
  });
}
