import { expect, test, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Exercise the map as an accessible UI, independently of GPU availability.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/id');
});

async function controlledNote(page: Page, node: Locator) {
  const id = await node.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return page.locator(`[id="${id}"]`);
}

async function expectTravelerMoving(traveler: Locator) {
  await expect(traveler).toHaveAttribute('transform', /\S+/);
  const initial = await traveler.getAttribute('transform');
  await expect.poll(() => traveler.getAttribute('transform')).not.toBe(initial);
}

async function expectTravelerStill(traveler: Locator) {
  // Check multiple rendered frames, rather than two coincidentally equal samples.
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

for (const [width, route] of [[1440, 'desktop'], [390, 'mobile']] as const) {
  test(`fish marker follows the ${route} route and pauses for reading and reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).not.toHaveClass(/reduced-motion/);
    const map = page.locator('#journal .learning-map');
    await map.evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 120, behavior: 'instant' }));
    await page.mouse.move(0, 0);
    await expect(map).toBeInViewport();
    await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
    const traveler = map.locator(`.map-route-${route} .map-traveler`);
    await expect(traveler).toBeVisible();
    await expectTravelerMoving(traveler);

    await map.locator('[data-map-node]').first().focus();
    await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);
    await expectTravelerStill(traveler);
    await page.keyboard.press('Escape');
    await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
    await expectTravelerMoving(traveler);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveClass(/reduced-motion/);
    await expectTravelerStill(traveler);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).not.toHaveClass(/reduced-motion/);
    await expectTravelerMoving(traveler);

    // The site's own motion preference must work independently of OS settings.
    await page.locator('.menu-toggle').click();
    await page.locator('.motion-toggle').click();
    await expect(page.locator('html')).toHaveClass(/reduced-motion/);
    await page.locator('.menu-close').click();
    await expectTravelerStill(traveler);
  });
}

test('map points explain their topics on hover and keyboard focus, with dismissible notes', async ({ page }) => {
  const map = page.locator('#journal .learning-map');
  const nodes = map.locator('button[data-map-node]');
  const notes = map.locator('.map-note');
  await expect(nodes).toHaveCount(5);
  await expect(notes).toHaveCount(5);

  const first = nodes.first();
  const firstNote = await controlledNote(page, first);
  await first.hover();
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(firstNote).toBeVisible();
  await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);

  const second = nodes.nth(1);
  await second.hover();
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(firstNote).toBeHidden();
  await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);

  await page.keyboard.press('Escape');
  await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
  await expect(second).toHaveAttribute('aria-expanded', 'false');

  await page.mouse.move(0, 0);
  await first.focus();
  await expect(firstNote).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(firstNote).toBeHidden();

  await nodes.last().focus();
  await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);
  await page.locator('#journal h2').click();
  await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
});

test('map descriptions localize while English point labels and journal navigation remain usable', async ({ page }) => {
  const nodes = page.locator('#journal button[data-map-node]');
  const labels = await nodes.allTextContents();
  await nodes.first().focus();
  const idNote = await controlledNote(page, nodes.first());
  const idText = await idNote.innerText();

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await nodes.allTextContents()).toEqual(labels);
  await nodes.first().focus();
  const enNote = await controlledNote(page, nodes.first());
  await expect(enNote).toBeVisible();
  expect(await enNote.innerText()).not.toBe(idText);

  await page.locator('#journal').getByRole('link', { name: 'Enter the journal', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/journal$/);
  await expect(page.locator('.journal-list')).toBeVisible();
});

for (const width of [390, 320]) {
  test.describe(`touch map at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });

    test('tapping selects one note at a time, keeps it within the screen, and toggles it closed', async ({ page }) => {
      const map = page.locator('#journal .learning-map');
      const nodes = map.locator('button[data-map-node]');
      for (const index of [0, 2, 4]) {
        const node = nodes.nth(index);
        await node.tap();
        await expect(node).toHaveAttribute('aria-expanded', 'true');
        await expect(map.locator('.map-note:not([hidden])')).toHaveCount(1);
        const note = await controlledNote(page, node);
        await expect(note).toBeVisible();
        const bounds = await note.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }

      await nodes.last().tap();
      await expect(nodes.last()).toHaveAttribute('aria-expanded', 'false');
      await expect(map.locator('.map-note:not([hidden])')).toHaveCount(0);
    });
  });
}
