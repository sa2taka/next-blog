import GoogleTagManager from '@/components/organisms/GoogleTagManager';
import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const Document: React.FC = () => {
  return (
    <Html lang="ja">
      <Head>
        <link rel="preload" as="image" href="/icon.webp" />
        <link rel="preload" as="image" href="/icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        {gtmId && <GoogleTagManager googleTagManagerId={gtmId} />}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="icon-152x152.png" />
        <meta name="theme-color" content="#009688" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
