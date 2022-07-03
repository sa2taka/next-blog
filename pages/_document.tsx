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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
