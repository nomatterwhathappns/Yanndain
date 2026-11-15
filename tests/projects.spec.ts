import { expect, test, type Locator } from '@playwright/test';

const realProjects = [
  { slug: 'studyos', title: 'StudyOS', repository: 'https://github.com/nomatterwhathappns/StudyOs' },
  { slug: 'ci-cd-pipeline-security-auditor', title: 'CI/CD Pipeline Security Auditor', repository: 'https://github.com/nomatterwhathappns/CI-CD-Pipeline-Security-Auditor' },
  { slug: 'recycle-bin-forensics', title: 'Recycle Bin Forensics', repository: 'https://github.com/nomatterwhathappns/Recycle-Bin-Forensics' },
  { slug: 'linscope', title: 'LinScope', repository: 'https://github.com/nomatterwhathappns/LinScope' },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // These checks cover content, links and routing independently of GPU support.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
});

async function expectRepositoryLink(link: Locator, repository: string) {
  await expect(link).toHaveAttribute('href', repository);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
  await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
  expect(await link.evaluate(element => element.parentElement?.closest('a') === null)).toBe(true);
}

test('the collection presents four real projects with separate, visible source links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/id#projects');
  const collection = page.locator('.featured-projects-panel');
  const rows = collection.locator('.featured-project');
  await expect(rows).toHaveCount(4);
  await expect(collection.locator('.preview-badge')).toHaveCount(0);
  await expect(page.locator('.featured-projects-heading')).not.toContainText('akan diisi dengan karya nyata');
  for (const [index, project] of realProjects.entries()) {
    const row = rows.nth(index);
    const detail = row.locator('.featured-project-link');
    await expect(detail).toHaveAttribute('href', `/id/projects/${project.slug}`);
    await expect(detail.locator('h3')).toHaveText(project.title);
    await expect(detail.locator('a')).toHaveCount(0);
    await expect(row.locator('.project-stack')).toContainText(/\S/);
    const source = row.locator('.project-actions .project-repository-link');
    await expectRepositoryLink(source, project.repository);
    await source.scrollIntoViewIfNeeded();
    await expect(source).toBeVisible();
    await expect(row.locator('.project-peek')).not.toHaveAttribute('open', '');
  }
  expect(errors).toEqual([]);
});

for (const project of realProjects) {
  test(`${project.title} has a localized, reloadable detail page and working source CTAs`, async ({ page }) => {
    const response = await page.goto(`/id/projects/${project.slug}`);
    expect(response?.status()).toBe(200);
    const detail = page.locator('.project-detail');
    await expect(detail.locator('h1')).toHaveText(project.title);
    await expect(detail.locator('.preview-badge, .content-notice')).toHaveCount(0);
    await expect(detail.locator('.article-body > section')).toHaveCount(4);
    await expect(detail.locator('.project-stack')).toContainText(/\S/);
    const sources = detail.locator('.project-repository-link');
    await expect(sources).toHaveCount(2);
    for (const source of await sources.all()) await expectRepositoryLink(source, project.repository);
    const indonesianSummary = await detail.locator('.project-summary > p').textContent();
    const indonesianBody = await detail.locator('.article-body').textContent();
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/en/projects/${project.slug}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(detail.locator('.project-summary > p')).not.toHaveText(indonesianSummary!);
    await expect(detail.locator('.article-body')).not.toHaveText(indonesianBody!);
    const reload = await page.reload();
    expect(reload?.status()).toBe(200);
    await expect(detail.locator('h1')).toHaveText(project.title);
    await expect(detail.locator('.project-summary .preview-badge')).toHaveCount(0);
    await expectRepositoryLink(detail.locator('.project-repository-link').first(), project.repository);
    await page.locator('.back-link').click();
    await expect(page).toHaveURL(/\/en#projects$/);
    await expect(page.locator('.featured-projects-panel')).toBeInViewport();
    await expect(page.locator('.featured-project-link')).toHaveCount(4);
  });
}

test('long project titles and source actions fit narrow mobile screens', async ({ page }) => {
  const project = realProjects[1];
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/id/projects/${project.slug}`);
    await expect(page.locator('.project-intro h1')).toHaveText(project.title);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const source = page.locator('.project-intro .project-repository-link');
    await source.scrollIntoViewIfNeeded();
    await expect(source).toBeInViewport();
    await page.locator('.back-link').click();
    await expect(page.locator('.featured-projects-panel')).toBeInViewport();
    const row = page.locator('.featured-project').nth(1);
    await expect(row.locator('h3')).toHaveText(project.title);
    const listSource = row.locator('.project-actions .project-repository-link');
    await listSource.scrollIntoViewIfNeeded();
    await expect(listSource).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.featured-project-link')).toHaveCount(4);
  }
});

test('contact links reach the supplied GitHub and Instagram accounts on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/id#contact');
  await expect(page.locator('#contact h2')).toBeInViewport();
  const contacts = page.locator('.contact-links');
  await expectRepositoryLink(contacts.getByRole('link', { name: 'GitHub', exact: true }), 'https://github.com/nomatterwhathappns');
  await expectRepositoryLink(contacts.getByRole('link', { name: 'Instagram', exact: true }), 'https://www.instagram.com/ryanndafajr?cplk=MWd4dzBndTd1ZjBoMg==');
  await expect(contacts.locator('.pending-contact')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
