import { expect, test } from '@playwright/test';

const postPath = '/post/what-is-vitest-related/';
const postTitle = 'Vitestのrelated/JestのfindRelatedTestsを深ぼる';
const tilPath = '/til/2025-05-06-diff-on-github/';
const tilTitle = 'GitHubのmarkdownでdiffを表示する';

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

test('blog post page renders its main article content', async ({ page }) => {
  await page.goto(postPath);

  await expect(page).toHaveURL(postPath);
  await expect(page.getByRole('heading', { level: 1, name: postTitle })).toBeVisible();
  await expect(page.getByText('作成日:')).toBeVisible();
  await expect(page.getByText('更新日:')).toBeVisible();
});

test('til detail page renders markdown content', async ({ page }) => {
  await page.goto(tilPath);

  await expect(page).toHaveURL(tilPath);
  await expect(page.getByRole('heading', { level: 2, name: tilTitle })).toBeVisible();
  await expect(page.getByText(/GitHubでコードブロックに.*差分表示ができる。/)).toBeVisible();
});
