import { fetchAllPost, fetchAllTil } from '../../src/libs/dataFetcher';
import { BASE_URL, BLOG_TITLE } from '../../src/libs/const';
import RSS from 'rss';
import { join } from 'path';
import { markdown } from '../../src/libs/markdown';
import { convert } from 'html-to-text';

export async function generatePostFeed() {
  const posts = await fetchAllPost();
  const tils = await fetchAllTil();

  const rss = new RSS({
    title: BLOG_TITLE,
    site_url: BASE_URL,
    feed_url: join(BASE_URL, 'rss.xml'),
  });

  posts.forEach((post) => {
    rss.item({
      title: post.title || post.slug,
      description: post.description,
      date: new Date(post.createdAt),
      url: `${BASE_URL}/post/${post.slug}`,
      categories: ['Post'],
    });
  });

  tils.forEach((til) => {
    rss.item({
      title: til.title || til.slug,
      description: extractDescriptionFromBody(til.body),
      date: new Date(til.createdAt),
      url: `${BASE_URL}/til/${til.slug}`,
      categories: ['TIL'],
    });
  });

  rss.items.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return rss.xml();
}

// 先頭130文字をdescriptionとして利用する
// 130文字を超える場合は...とする
// Markdownをhtmlとしてパースして、先頭130文字をdescriptionとして利用する
// htmlのタグは無視する。
const extractDescriptionFromBody = (tilBody: string) => {
  const html = markdown.render(tilBody);
  const text = convert(html, {
    wordwrap: 130,
    selectors: [
      { selector: 'code.hljsspan', format: 'inlineSurround' },
      { selector: 'code', format: 'skip' },
      { selector: 'a', options: { ignoreHref: true } },
    ],
  });

  return text.slice(0, 130) + '...';
};
