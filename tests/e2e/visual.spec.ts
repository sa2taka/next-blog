import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const waitForVisualStability = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
};

const captureScrollSnapshots = async (page: Page, snapshotPrefix: string) => {
  const totalSegments = 3;
  const scrollRatios = Array.from({ length: totalSegments }, (_, index) => {
    if (totalSegments === 1) {
      return 0;
    }

    return index / (totalSegments - 1);
  });

  for (const [index, scrollRatio] of scrollRatios.entries()) {
    await page.evaluate((targetRatio) => {
      const maxScrollY = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0
      );
      const targetY = Math.round(maxScrollY * targetRatio);

      window.scrollTo({ top: targetY, behavior: 'instant' });
    }, scrollRatio);
    await page.waitForTimeout(150);
    await waitForVisualStability(page);
    await expect(page).toHaveScreenshot(`${snapshotPrefix}-segment-${index + 1}.png`, {
      maxDiffPixelRatio: 0.06,
    });
  }
};

test('blog post visual snapshot stays stable', async ({ page }) => {
  await page.goto('/post/what-is-vitest-related/');
  await waitForVisualStability(page);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Vitestのrelated/JestのfindRelatedTestsを深ぼる' })
  ).toBeVisible();

  await captureScrollSnapshots(page, 'post-what-is-vitest-related');
});

test('til page visual snapshot stays stable', async ({ page }) => {
  await page.goto('/til/2025-05-06-diff-on-github/');
  await waitForVisualStability(page);
  await expect(
    page.getByRole('heading', { level: 2, name: 'GitHubのmarkdownでdiffを表示する' })
  ).toBeVisible();

  await captureScrollSnapshots(page, 'til-2025-05-06-diff-on-github');
});
