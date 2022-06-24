import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { Post } from '@/types/entry';
import { GetStaticPaths, GetStaticProps } from 'next';
import React, { useMemo } from 'react';
import { PostIndexItem } from '../../src/types/postIndex';
import { generatePostBreadcrumbsList } from '../../src/libs/breadcrumbsGenerator';
import { PostArea } from '@/components/orgnisms/PostArea';
import Head from 'next/head';
import Script from 'next/script';

interface Props {
  post: Post;
  rawBodyHtml: string;
  postIndex: PostIndexItem[];
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const { fetchAllPost } = await import('@/libs/contentful');

  const posts = await fetchAllPost();

  return {
    paths: posts.items.map((post) => ({
      params: {
        slug: post.fields.slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { fetchPost } = await import('@/libs/contentful');

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

  const { markdown } = await import('@/libs/markdown');
  const rawBodyHtml = markdown.render(post.fields.body);
  const { generateIndices } = await import('@/libs/generateIndices');
  const postIndex = generateIndices(post.fields.body);

  // HACK: post.fields.body does not use after this process.
  // Delete body to reduce traffic.
  post.fields.body = '';

  return {
    props: {
      post,
      rawBodyHtml,
      postIndex,
    },
  };
};

const PostHead: React.FC<{ latex: boolean }> = ({ latex }) => {
  return (
    <Head>
      {latex && (
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
      <PostHead latex={post.fields.latex} />
      <Breadcrumbs list={breadcrumbsList} />
      <PostArea post={post} rawHtml={rawBodyHtml} index={postIndex} />
    </>
  );
};

export default PostPage;
