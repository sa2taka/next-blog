import { expect, test, type Page } from '@playwright/test';

type PageSnapshot = {
  name: string;
  path: string;
  fullPage: boolean;
  ready: (page: Page) => Promise<void>;
};

const pageSnapshots: PageSnapshot[] = [
  {
    name: 'home',
    path: '/',
    // The index lists dozens of cards. The first viewport is the shell.
    fullPage: false,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', { name: '言葉の向こうに世界を見る' })
      ).toBeVisible();
    },
  },
  {
    name: 'til-index',
    path: '/til/',
    // The TIL index renders every note body. A full-page image would track all of them.
    fullPage: false,
    ready: async (page) => {
      await expect(
        page.getByRole('main').locator('div').filter({ hasText: /^TIL$/ })
      ).toBeVisible();
    },
  },
  {
    name: 'category-index',
    path: '/category/',
    fullPage: true,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', { name: 'カテゴリ' })
      ).toBeVisible();
    },
  },
  {
    name: 'category-git',
    path: '/category/git/1/',
    fullPage: true,
    ready: async (page) => {
      await expect(page.getByRole('heading', { name: 'Git' })).toBeVisible();
    },
  },
  {
    name: 'guide',
    path: '/guide/',
    fullPage: true,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', { level: 1, name: '当サイト利用について' })
      ).toBeVisible();
    },
  },
  {
    name: 'post-article',
    path: '/post/what-is-vitest-related/',
    // The article continues for many embedded sources. The first viewport holds the title and dates.
    fullPage: false,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'Vitestのrelated/JestのfindRelatedTestsを深ぼる',
        })
      ).toBeVisible();
    },
  },
  {
    name: 'til-code-image-embed',
    path: '/til/2025-05-06-diff-on-github/',
    fullPage: true,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', { name: 'GitHubのmarkdownでdiffを表示する' })
      ).toBeVisible();
    },
  },
  {
    name: 'til-code-and-container',
    path: '/til/2025-02-20-vitest-related/',
    fullPage: true,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', {
          name: 'Vitestで「そのファイルに関連したテスト」を書く',
        })
      ).toBeVisible();
    },
  },
  {
    name: 'til-footnotes',
    path: '/til/2024-10-31-epistemic-curiosity/',
    fullPage: true,
    ready: async (page) => {
      await expect(
        page.getByRole('heading', { name: '特殊的好奇心と好奇心の尺度' })
      ).toBeVisible();
    },
  },
];

const settleVisuals = async (page: Page) => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    const scrollStep = window.innerHeight;
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );

    for (let offset = 0; offset <= maxScroll; offset += scrollStep) {
      window.scrollTo({ top: offset, behavior: 'instant' });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    await Promise.all(
      [...document.images].map(async (image) => {
        if (image.complete) {
          return;
        }
        await image.decode().catch(() => undefined);
      })
    );
    await document.fonts.ready;
  });
  await page.waitForLoadState('networkidle');
};

for (const snapshot of pageSnapshots) {
  test(`${snapshot.name} appearance stays within the visual baseline`, async ({
    page,
  }) => {
    await page.goto(snapshot.path);
    await snapshot.ready(page);
    await settleVisuals(page);

    await expect(page).toHaveScreenshot(`${snapshot.name}.png`, {
      fullPage: snapshot.fullPage,
    });
  });
}

test('katex formula appearance stays within the visual baseline', async ({
  page,
}) => {
  await page.goto('/post/diffie-hellman-key-exchange/');

  const formula = page.locator('.katex-display').first();
  await expect(formula).toBeVisible({ timeout: 15_000 });
  await page.waitForFunction(() =>
    [...document.querySelectorAll('link')].some(
      (link) => link.href.includes('katex.min.css') && link.sheet !== null
    )
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  await expect(formula).toHaveScreenshot('katex-formula.png');
});
