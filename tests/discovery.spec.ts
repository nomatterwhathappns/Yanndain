import { expect, test } from '@playwright/test';

async function withoutGPU(page: import('@playwright/test').Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/id');
}

test('context hints teach the map locally, stop after use, and can be replayed from the menu', async ({ page }) => {
  await withoutGPU(page);
  const map = page.locator('.learning-map');
  await map.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 100, behavior: 'instant' }));
  const cue = page.locator('.discovery-cue');
  await expect(cue).toBeVisible();
  await expect(cue).toHaveAttribute('data-feature', 'map-nodes');
  await expect(cue).toContainText('Sorot titik');
  await expect(page.locator('.discovery-target')).toHaveCount(1);
  const node = page.locator('.map-node').first();
  await node.hover();
  await expect(node).toHaveAttribute('aria-expanded', 'true');
  const bounds = (await node.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width + 25, bounds.y + 26);
  await expect(node).toHaveAttribute('aria-expanded', 'false');
  await expect(cue).toHaveAttribute('data-feature', 'map-route');
  const fish = page.locator('.map-route-desktop .map-traveler');
  const initial = await fish.getAttribute('transform');
  await page.locator('.map-guide-next').click();
  await expect(fish).not.toHaveAttribute('transform', initial!);
  await expect(cue).toBeHidden();
  // Clicking a toolbar outside the viewport may scroll the chart out of view.
  // Replay is contextual: first bring its actual target back onto the screen.
  await map.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 100, behavior: 'instant' }));
  await page.locator('.menu-toggle').click();
  await page.locator('.interaction-help summary').click();
  await expect(page.locator('.interaction-help')).toContainText('Tombol panah');
  await page.locator('.replay-hints').click();
  await expect(cue).toBeVisible();
  await expect(cue).toHaveAttribute('data-feature', 'map-nodes');
  await cue.getByRole('button').click();
  await expect(cue).toBeHidden();
  await expect(page.locator('.discovery-target')).toHaveCount(0);
});

test('project peeks keep direct links and restore the expanded item and collection position', async ({ page }) => {
  await withoutGPU(page);
  const panel = page.locator('.featured-projects-panel');
  const peek = page.locator('.project-peek').nth(1);
  await peek.locator('summary').click();
  await expect(peek).toHaveAttribute('open', '');
  await expect(peek).toContainText('The analysis');
  const other = page.locator('.project-peek').first();
  await other.locator('summary').click();
  await expect(other).toHaveAttribute('open', '');
  await expect(peek).not.toHaveAttribute('open', '');
  await other.locator('.project-peek-content a').click();
  await expect(page).toHaveURL(/\/id\/projects\/lab-preview$/);
  await page.locator('.back-link').click();
  await expect(panel).toBeInViewport();
  await expect(other).toHaveAttribute('open', '');
  await expect(page.locator('.featured-project-link')).toHaveCount(3);
  await page.locator('.featured-project-link').last().click();
  await expect(page).toHaveURL(/\/id\/projects\/automation-preview$/);
  await page.locator('.back-link').click();
  expect(await panel.evaluate(el => el.scrollTop)).toBeGreaterThan(30);
});

test('topic emphasis, keyboard guidance and bilingual help work without WebGL or animation', async ({ page }) => {
  await withoutGPU(page);
  await page.locator('[data-map-filter="defensive"]').click();
  await expect(page.locator('.map-stop.is-related')).toHaveCount(3);
  await expect(page.locator('.map-stop.is-unrelated')).toHaveCount(2);
  await page.locator('[data-map-filter="all"]').click();
  await expect(page.locator('.map-stop.is-unrelated')).toHaveCount(0);
  await page.locator('.map-guide-next').focus();
  await page.keyboard.press('Enter');
  await page.locator('.map-node').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.map-node').nth(1)).toBeFocused();
  await expect(page.locator('.map-note:not([hidden])')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.map-note:not([hidden])')).toHaveCount(0);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.map-guide-next')).toHaveText('Guide the fish');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.explore-launch')).toBeHidden();
  await page.locator('.interaction-help summary').click();
  await expect(page.locator('.interaction-help')).toContainText('Arrow keys');
  expect(await page.locator('.discovery-target').count()).toBe(0);
});

test.describe('touch guidance', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('hints teach tapping, dismiss locally, and never overflow or trap page scrolling', async ({ page }) => {
    await withoutGPU(page);
    await page.locator('.learning-map').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 100, behavior: 'instant' }));
    const cue = page.locator('.discovery-cue');
    await expect(cue).toBeVisible();
    await expect(cue).toContainText('Ketuk titik');
    await page.locator('.map-node').first().tap();
    await expect(page.locator('.map-note:not([hidden])')).toHaveCount(1);
    await page.locator('.map-note:not([hidden]) .map-note-close').tap();
    await expect(page.locator('.map-note:not([hidden])')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact h2')).toBeInViewport();
    await expect(cue).toBeHidden();
  });
});

test('ocean exploration pans real WebGL, resets, traps focus locally and returns to the same reading position', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/id');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'ready', { timeout: 60_000 });
  await page.locator('#about').scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  await page.locator('.menu-toggle').click();
  await page.locator('.explore-launch').click();
  const explorer = page.locator('#ocean-explorer');
  await expect(explorer).toBeVisible();
  await expect(page.locator('.explore-water')).toBeFocused();
  await expect(page.locator('#content')).toBeHidden();
  const view = { x: 80, y: 150, width: 1280, height: 600 };
  // Compare the water, excluding the dialog's changing instructions and focus.
  const original = await page.screenshot({ clip: view });
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#explore-instruction')).toContainText('tombol panah');
  const panned = await page.screenshot({ clip: view });
  expect(panned.equals(original)).toBe(false);
  await page.locator('.explore-reset').click();
  const reset = await page.screenshot({ clip: view });
  expect(reset.equals(original)).toBe(true);
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    expect(await explorer.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(explorer).not.toBeVisible();
  await expect(page.locator('.menu-toggle')).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(position);
  await expect(page.locator('#content')).toBeVisible();
  await expect(page.locator('#ocean')).toHaveAttribute('data-fish-count', '900');
  expect(errors).toEqual([]);
});
