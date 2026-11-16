import { expect, test, type Page } from '@playwright/test';

const storyPath = '/journal/finding-my-way-into-security';
const storyTitle = 'Finding my way into security.';
const certificateSources = [
  {
    title: 'Regular Online – Cyber Security Beginner', date: '2025-09-17',
    url: 'https://drive.google.com/file/d/1XltS5kQtqmtTaRW2OPpSxb1g7pUuDbDw/view',
  },
  {
    title: 'Belajar Dasar Pemrograman Web', date: '2024-11-15',
    url: 'https://drive.google.com/file/d/1odtCLZgeoloYPMJMT34x7lUugfbynegf/view',
  },
  {
    title: 'AWS SimuLearn: Cloud Computing Essentials', date: '2026-08-15',
    url: 'https://drive.google.com/file/d/1vhHwCVSNCLWrmClz_N7zgPVtW7Dx76pe/view',
  },
  {
    title: 'Java (Basic)', date: '2026-04-05',
    url: 'https://drive.google.com/file/d/1_H90_Eb9rd8S7FK6vdjUe0gB_tqlAeX1/view',
  },
  {
    title: 'Regulasi & Best Practice Penggunaan Cloud di Sektor Publik (Bahasa Indonesia)', date: '2026-07-20',
    url: 'https://drive.google.com/file/d/1WRSXxYxqx-KlIZvVecCrE3knC2mJpVAc/view',
  },
  {
    title: 'Amazon DynamoDB Service Primer (Bahasa Indonesia)', date: '2026-08-04',
    url: 'https://drive.google.com/file/d/1hABBcGOuCGrTfLfySjEgPRK7tP4XM_pc/view',
  },
  {
    title: 'Job Roles in the Cloud (Bahasa Indonesia)', date: '2026-06-27',
    url: 'https://drive.google.com/file/d/1HByAjpVL-J2pDswKzsl4GNaeOy8zSWoS/view',
  },
  {
    title: 'Microcredential Preview Experience', date: '2026-08-15',
    url: 'https://drive.google.com/file/d/1FKeXp0qTLIG-fQIUQDyze7B3BefLzDDV/view',
  },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // These are reading and navigation checks; they must also work without a GPU.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
});

async function settled(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'fallback');
  await page.evaluate(() => document.fonts.ready);
}

test('the home map describes the personal journey and filters its related stages', async ({ page }) => {
  await page.goto('/id');
  await settled(page);
  await expect(page.locator('#journal h2')).toHaveText(/My learning\s*journey\./);
  const filters = page.locator('[data-map-filter]');
  expect(await filters.evaluateAll(elements => elements.map(element => element.getAttribute('data-map-filter')))).toEqual([
    'all', 'beginnings', 'practice', 'direction',
  ]);

  for (const [filter, stages] of [
    ['beginnings', ['first-steps', 'choosing-cyber']],
    ['practice', ['learning-path', 'hands-on-labs', 'still-exploring']],
    ['direction', ['choosing-cyber', 'still-exploring']],
  ] as const) {
    const button = page.locator(`[data-map-filter="${filter}"]`);
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    const related = page.locator('.map-stop.is-related [data-map-node]');
    expect(await related.evaluateAll(elements => elements.map(element => element.getAttribute('data-map-node')))).toEqual(stages);
    await expect(page.locator('.map-stop.is-unrelated')).toHaveCount(5 - stages.length);
  }

  await page.locator('[data-map-filter="all"]').click();
  await expect(page.locator('.map-stop.is-unrelated')).toHaveCount(0);
  await page.locator('#journal').getByRole('link', { name: 'Baca perjalanan saya', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/id${storyPath}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(storyTitle);
  await expect(page.locator('.article-body section')).toHaveCount(6);
});

test('the published story preserves the chronology, completed labs and unfinished work', async ({ page }) => {
  await page.goto(`/en${storyPath}`);
  await settled(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(storyTitle);
  const sections = page.locator('.article-body section');
  await expect(sections).toHaveCount(6);
  await expect(page.locator('article .preview-badge, article .content-notice')).toHaveCount(0);

  await expect(sections.nth(0)).toContainText('2023');
  await expect(sections.nth(0)).toContainText('fullstack developer');
  await expect(sections.nth(1)).toContainText(/July[–-]August 2024/);
  await expect(sections.nth(1)).toContainText('AI and cybersecurity');
  await expect(sections.nth(1)).toContainText('chose to focus more on cybersecurity');
  await expect(sections.nth(3)).toContainText('Coding Studio');
  await expect(sections.nth(3)).toContainText('Nmap, Gobuster, and OWASP');
  await expect(sections.nth(3)).toContainText('OWASP Juice Shop on TryHackMe');
  await expect(sections.nth(3)).toContainText('XSS');
  await expect(sections.nth(3)).toContainText('certificate was issued on 17 September 2025');

  const practice = sections.nth(4);
  await expect(practice).toContainText('five THM rooms I have completed');
  for (const room of ['Kenobi', 'Mr Robot CTF', 'OWASP Juice Shop', 'RootMe', 'Vulnversity']) {
    await expect(practice).toContainText(room);
  }
  await expect(practice).toContainText('On HTB, I have completed Cap, Silentium, and Principal.');
  await expect(practice).toContainText('Unified and Vaccine remain unfinished');
  await expect(practice).toContainText('PortSwigger');
  await expect(practice).toContainText('UNION');
  await expect(sections.nth(5)).toContainText('becoming a Security Engineer');
  await expect(sections.nth(5)).toContainText('journey is still ongoing');
});

test('the real journal article translates, keeps English headings and survives a direct reload', async ({ page }) => {
  await page.goto('/id/journal');
  await settled(page);
  await page.locator('.journal-card').click();
  await expect(page).toHaveURL(new RegExp(`/id${storyPath}$`));
  const headings = await page.locator('.article-body h2').allTextContents();
  const indonesian = await page.locator('.article-body').innerText();
  await expect(page.locator('.article-body')).toContainText('Juli–Agustus 2024');
  await expect(page.locator('.article-body')).toContainText('Unified dan Vaccine belum');

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/en${storyPath}$`));
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.locator('.article-body h2').allTextContents()).toEqual(headings);
  expect(await page.locator('.article-body').innerText()).not.toBe(indonesian);
  const response = await page.reload();
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(storyTitle);
  await expect(page.locator('.article-body section')).toHaveCount(6);
  await expect(page.locator('article .preview-badge, article .content-notice')).toHaveCount(0);
});

test('certificates show four selected records, disclose four more and keep the original evidence links', async ({ page }) => {
  await page.goto('/id/journal');
  await settled(page);
  const collection = page.locator('#certificates');
  const cards = collection.locator('.certificate-card');
  const more = collection.locator('details.more-certificates');
  await expect(cards).toHaveCount(8);
  await expect(cards.filter({ visible: true })).toHaveCount(4);
  await expect(more).not.toHaveAttribute('open', '');
  await expect(more.locator('.certificate-card')).toHaveCount(4);
  for (const source of certificateSources.slice(0, 4)) {
    await expect(collection.getByRole('heading', { name: source.title, exact: true })).toBeVisible();
  }
  await more.locator('summary').click();
  await expect(cards.filter({ visible: true })).toHaveCount(8);

  for (const source of certificateSources) {
    const card = cards.filter({ has: page.getByRole('heading', { name: source.title, exact: true }) });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(source.title === 'Java (Basic)' ? 'Tes keterampilan' : 'Penyelesaian kelas');
    await expect(card.locator(`time[datetime="${source.date}"]`)).toHaveCount(1);
    const link = card.locator('a.certificate-link');
    await expect(link).toHaveAttribute('href', source.url);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
  }
  await expect(collection.locator('a.certificate-verify')).toHaveAttribute('href', 'https://dicoding.com/certificates/0LZ0Y28JNX65');
  const dicoding = cards.filter({ has: page.getByRole('heading', { name: 'Belajar Dasar Pemrograman Web', exact: true }) });
  await expect(dicoding.locator('time[datetime="2027-11-15"]')).toHaveCount(1);

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(collection.locator('.certificate-card').filter({ hasText: 'Course completion' })).toHaveCount(7);
  await expect(collection.locator('.certificate-card').filter({ hasText: 'Skills test' })).toHaveCount(1);
  await expect(collection.locator('a.certificate-link')).toHaveCount(8);
});

test.describe('journey reading on a 320px screen', () => {
  test.use({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true });

  test('certificate disclosure and both article languages fit without horizontal scrolling', async ({ page }) => {
    await page.goto('/id/journal');
    await settled(page);
    const collection = page.locator('#certificates');
    await expect(collection.locator('.certificate-card').filter({ visible: true })).toHaveCount(4);
    await collection.locator('details.more-certificates summary').tap();
    await expect(collection.locator('.certificate-card').filter({ visible: true })).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const card of await collection.locator('.certificate-card').all()) {
      const bounds = await card.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(321);
    }

    await page.locator('.journal-card').tap();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(storyTitle);
    await expect(page.locator('.article-body section')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'EN', exact: true }).tap();
    await page.reload();
    await settled(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.article-body section')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
