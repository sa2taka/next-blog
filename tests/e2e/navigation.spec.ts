import { expect, test, type Page } from '@playwright/test';

const postPath = '/post/what-is-vitest-related/';
const postTitle = 'Vitestのrelated/JestのfindRelatedTestsを深ぼる';
const tilPath = '/til/2025-05-06-diff-on-github/';
const tilTitle = 'GitHubのmarkdownでdiffを表示する';
const memoCategoryLinkName = /^チラシの裏 \(\d+\)$/;

const postLinks = (page: Page) =>
  page.getByRole('main').locator('a[href^="/post/"]');

test('global navigation reaches the TIL index', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: '言葉の向こうに世界を見る' })
  ).toBeVisible();

  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'TIL', exact: true })
    .click();

  await expect(page).toHaveURL(/\/til\/?$/);
  await expect(page.getByRole('link', { name: tilTitle })).toBeVisible();
});

test('opening a category from the global navigation lists its article', async ({
  page,
}) => {
  await page.goto('/');

  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Category', exact: true })
    .click();

  await expect(page).toHaveURL(/\/category\/?$/);
  await expect(page.getByRole('heading', { name: 'カテゴリ' })).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: memoCategoryLinkName }).click();

  await expect(page).toHaveURL(/\/category\/memo\/1\/?$/);
  await expect(page.getByRole('heading', { name: 'チラシの裏' })).toBeVisible();
  await expect(page.getByRole('link', { name: postTitle })).toBeVisible();
});

test('second page of the post list omits the first page articles', async ({
  page,
}) => {
  await page.goto('/');

  const firstPageArticleHref = await postLinks(page)
    .first()
    .getAttribute('href');
  if (!firstPageArticleHref) {
    throw new Error('The first page has no article link.');
  }

  await page
    .getByRole('navigation', { name: 'ページネーションナビゲーション' })
    .getByRole('link', { name: '2', exact: true })
    .first()
    .click();

  await expect(page).toHaveURL(/\/page\/2\/?$/);
  await expect(page.locator(`a[href="${firstPageArticleHref}"]`)).toHaveCount(
    0
  );
  await expect(postLinks(page).first()).toBeVisible();
});

test('blog post page renders its main article content', async ({ page }) => {
  await page.goto(postPath);

  await expect(page).toHaveURL(postPath);
  await expect(
    page.getByRole('heading', { level: 1, name: postTitle })
  ).toBeVisible();
  await expect(page.getByText('作成日:')).toBeVisible();
  await expect(page.getByText('更新日:')).toBeVisible();
});

test('til detail page renders markdown content', async ({ page }) => {
  await page.goto(tilPath);

  await expect(page).toHaveURL(tilPath);
  await expect(
    page.getByRole('heading', { level: 2, name: tilTitle })
  ).toBeVisible();
  await expect(
    page.getByText(/GitHubでコードブロックに.*差分表示ができる。/)
  ).toBeVisible();
});

test('footer guide link opens the site usage page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: '当サイト利用について' }).click();

  await expect(page).toHaveURL(/\/guide\/?$/);
  await expect(
    page.getByRole('heading', { level: 1, name: '当サイト利用について' })
  ).toBeVisible();
});
