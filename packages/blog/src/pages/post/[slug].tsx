import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { PostArea } from '@blog/components/organisms/PostArea';
import { generatePostBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { AUTHOR, BASE_URL, BLOG_TITLE, TWITTER_SITE } from '@blog/libs/const';
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_TWITTER_IMAGE,
  resolveOgImageUrl,
} from '@blog/libs/ogImage';
import { Post } from '@blog/types/entry';
import { PostIndexItem } from '@blog/types/postIndex';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import React, { useMemo } from 'react';

interface Props {
  post: Post;
  rawBodyHtml: string;
  postIndex: PostIndexItem[];
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const { fetchAllPost } = await import('@blog/libs/dataFetcher');

  const posts = await fetchAllPost();

  return {
    paths: posts.map((post) => ({
      params: {
        slug: post.slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { fetchPost } = await import('@blog/libs/dataFetcher');

  if (!context.params || !context.params.slug || context.params.slug === '') {
    return {
      notFound: true,
    };
  }
  const parsedSlug =
    typeof context.params.slug === 'object'
      ? context.params.slug[0]
      : context.params.slug;
  const post = await fetchPost(parsedSlug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  const { markdown } = await import('@blog/libs/markdown');
  const rawBodyHtml = markdown.render(post.body);
  const { generateIndices } = await import('@blog/libs/generateIndices');
  const postIndex = generateIndices(post.body);

  return {
    props: {
      post,
      rawBodyHtml,
      postIndex,
    },
  };
};

const getSeoStructureData = (post: Post, path: string) => {
  const image = resolveOgImageUrl(post.ogImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': new URL(path, BASE_URL).toString(),
    },
    headline: post.title,
    image: [image],
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: 'sa2taka',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_TWITTER_IMAGE,
      },
    },
  };
};

const PostHead: React.FC<{ post: Post }> = ({ post }) => {
  const router = useRouter();
  const path = router.asPath.split('#')[0]?.split('?')[0] || '/';
  const pageUrl = new URL(path, BASE_URL).toString();
  const ogImageUrl = resolveOgImageUrl(post.ogImage);
  const hasCustomOgImage = Boolean(post.ogImage);
  const socialImageAlt = hasCustomOgImage
    ? `${post.title} の OGP 画像`
    : DEFAULT_OG_IMAGE_ALT;

  return (
    <Head>
      <title>{post.title}</title>
      <meta
        key="description"
        name="description"
        content={post.description}
      />
      <meta key="og:title" property="og:title" content={post.title} />
      <meta
        key="og:description"
        property="og:description"
        content={post.description}
      />
      <meta key="og:type" property="og:type" content="article" />
      <meta key="og:url" property="og:url" content={pageUrl} />
      <meta key="og:site_name" property="og:site_name" content={BLOG_TITLE} />
      <meta key="og:image" property="og:image" content={ogImageUrl} />
      <meta
        key="og:image:secure_url"
        property="og:image:secure_url"
        content={ogImageUrl}
      />
      <meta
        key="og:image:alt"
        property="og:image:alt"
        content={socialImageAlt}
      />
      <meta
        key="article:published_time"
        property="article:published_time"
        content={new Date(post.createdAt).toISOString()}
      />
      <meta
        key="article:modified_time"
        property="article:modified_time"
        content={new Date(post.updatedAt).toISOString()}
      />
      <meta key="twitter:title" name="twitter:title" content={post.title} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={post.description}
      />
      <meta
        key="twitter:image"
        name="twitter:image"
        content={ogImageUrl}
      />
      <meta
        key="twitter:image:alt"
        name="twitter:image:alt"
        content={socialImageAlt}
      />
      <meta
        key="twitter:card"
        name="twitter:card"
        content={hasCustomOgImage ? 'summary_large_image' : 'summary'}
      />
      <meta key="twitter:site" name="twitter:site" content={TWITTER_SITE} />
      <meta
        key="twitter:creator"
        name="twitter:creator"
        content={TWITTER_SITE}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSeoStructureData(post, path)),
        }}
      />

      {post.latex && (
        <>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css"
            integrity="sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC"
            crossOrigin="anonymous"
          />
          <Script
            defer
            src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"
            integrity="sha384-X/XCfMm41VSsqRNQgDerQczD69XqmjOOOwYQvr/uuC+j4OPoNhVgjdGFwhvN02Ja"
            crossOrigin="anonymous"
          />
          <Script
            defer
            src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js"
            integrity="sha384-+XBljXPPiv+OzfbB3cVmLHf4hdUFHlWNZN5spNQ7rmHTXpd7WvJum6fIACpNNfIR"
            crossOrigin="anonymous"
            // @ts-ignore
            onLoad={() => renderMathInElement(document.body)}
          />
        </>
      )}
    </Head>
  );
};

const PostPage: React.FC<Props> = ({ post, rawBodyHtml, postIndex }) => {
  const breadcrumbsList = useMemo(
    () => generatePostBreadcrumbsList(post),
    [post]
  );
  return (
    <>
      <PostHead post={post} />
      <Breadcrumbs list={breadcrumbsList} />
      <PostArea post={post} rawHtml={rawBodyHtml} index={postIndex} />
    </>
  );
};

export default PostPage;
