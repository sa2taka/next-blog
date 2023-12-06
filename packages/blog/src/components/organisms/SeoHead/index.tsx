import { BASE_URL } from '@blog/libs/const';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

interface Props {}

export const SeoHead: React.FC<Props> = ({}) => {
  const router = useRouter();
  const currentPath = router.asPath;
  const sitePath = `${BASE_URL}${currentPath}`;

  const isContentPage =
    currentPath.startsWith('/post/') || currentPath.match('^/til/.+ ');

  return (
    <Head>
      <meta data-hid="charset" charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {!isContentPage && (
        <>
          <meta
            name="description"
            content="sa2taka/t0p_l1ghtの独断と偏見が混じった、エンジニア、プログラマーのためのニッチな記事を残すブログです。"
          />
          <meta
            data-hid="og:title"
            property="og:title"
            content="言葉の向こうに世界を見る | sa2taka blog"
          />
          <meta
            data-hid="og:description"
            property="og:description"
            content="sa2taka/t0p_l1ghtの独断と偏見が混じった、エンジニア、プログラマーのためのニッチな記事を残すブログです。"
          />
        </>
      )}
      <meta data-hid="og:type" property="og:type" content="website" />
      <meta
        data-hid="og:image"
        property="og:image"
        content="https://blog.sa2taka.com/logo-for-facebook.png"
      />
      <meta data-hid="twitter:card" property="twitter:card" content="summary" />
      <meta
        data-hid="twitter:image"
        property="twitter:image"
        content="https://blog.sa2taka.com/logo-for-twitter.png"
      />
      <meta
        data-hid="twitter:site"
        property="twitter:site"
        content="@t0p_l1ght"
      />
      <meta
        data-hid="og:site_name"
        property="og:site_name"
        content="言葉の向こうに世界を見る"
      />
      <meta data-hid="og:url" property="og:url" content={sitePath} />

      <link rel="canonical" href={sitePath} />
    </Head>
  );
};
