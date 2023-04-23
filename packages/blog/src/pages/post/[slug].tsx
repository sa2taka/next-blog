import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { Post } from '@blog/types/entry';
import { GetStaticPaths, GetStaticProps } from 'next';
import React, { useMemo } from 'react';
import { PostIndexItem } from '@blog/types/postIndex';
import { generatePostBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { PostArea } from '@blog/components/organisms/PostArea';
import Head from 'next/head';
import Script from 'next/script';
import { AUTHOR, BASE_URL } from '@blog/libs/const';
import { useRouter } from 'next/router';

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
  const image = BASE_URL + '/logo.png';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': BASE_URL + path,
    },
    headline: post.title,
    image: [image],
    datePublished: post.createdAt.toString(),
    dateModified: post.updatedAt.toString(),
    author: {
      '@type': 'Person',
      name: AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: 'sa2taka',
      logo: {
        '@type': 'ImageObject',
        url: BASE_URL + '/logo-for-twitter.png',
      },
    },
  };
};
const PostHead: React.FC<{ post: Post }> = ({ post }) => {
  const router = useRouter();
  const path = router.pathname;

  return (
    <Head>
      <title>{post.title}</title>
      <meta
        data-hid="description"
        name="description"
        content={post.description}
      />
      <meta data-hid="og:title" name="og:title" content={post.title} />
      <meta
        data-hid="og:description"
        name="og:description"
        content={post.description}
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
