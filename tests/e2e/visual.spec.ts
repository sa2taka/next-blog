import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const waitForVisualStability = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
};

test('blog post visual snapshot stays stable', async ({ page }) => {
  await page.goto('/post/what-is-vitest-related/');
  await waitForVisualStability(page);

  await expect(page).toHaveScreenshot('post-what-is-vitest-related.png', {
    fullPage: true,
  });
});

test('til page visual snapshot stays stable', async ({ page }) => {
  await page.goto('/til/2025-05-06-diff-on-github/');
  await waitForVisualStability(page);

  await expect(page).toHaveScreenshot('til-2025-05-06-diff-on-github.png', {
    fullPage: true,
  });
});
