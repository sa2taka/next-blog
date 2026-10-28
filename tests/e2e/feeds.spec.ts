import { expect, test, type APIRequestContext } from '@playwright/test';

const representativePostPath = '/post/what-is-vitest-related';

const readOkBody = async (request: APIRequestContext, pathname: string) => {
  const response = await request.get(pathname);
  expect(response.ok(), pathname).toBeTruthy();
  return response.text();
};

test('rss feed lists a published post', async ({ request }) => {
  const body = await readOkBody(request, '/rss.xml');

  expect(body).toContain(representativePostPath);
});

test('sitemap lists a published post', async ({ request }) => {
  const indexBody = await readOkBody(request, '/sitemap.xml');
  const sitemapBodies = [indexBody];

  if (!indexBody.includes(representativePostPath)) {
    const childPaths = [...indexBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1]).pathname
    );
    expect(childPaths.length).toBeGreaterThan(0);

    for (const childPath of childPaths) {
      sitemapBodies.push(await readOkBody(request, childPath));
    }
  }

  expect(
    sitemapBodies.some((body) => body.includes(representativePostPath))
  ).toBe(true);
});
