import { Head, Html, Main, NextScript } from 'next/document';
import Link from 'next/link';
import React from 'react';

const Document: React.FC = () => {
  return (
    <Html lang="ja">
      <Head>
        <link rel="preload" as="image" href="/icon.webp" />
        <link rel="preload" as="image" href="/icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
