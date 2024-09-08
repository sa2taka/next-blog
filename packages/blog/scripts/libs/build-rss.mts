import { fetchAllPost, fetchAllTil } from '../../src/libs/dataFetcher';
import { BASE_URL, BLOG_TITLE } from '../../src/libs/const';
import RSS from 'rss';
import { join } from 'path';

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
    });
  });

  tils.forEach((til) => {
    rss.item({
      title: til.title || til.slug,
      date: new Date(til.createdAt),
      url: `${BASE_URL}/til/${til.slug}`,
    });
  });

  return rss.xml();
}
