import { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

// React実行前にhtml要素へテーマclassを設定し、テーマ切り替え時の画面フラッシュを防ぐ。
// libs/theme.tsのgetThemeFromStorage/applyThemeClassとロジックを揃えること。
const noFlashThemeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.add(t==='light'?'theme--light':'theme--dark');}catch(e){document.documentElement.classList.add('theme--dark');}})();`;

const Document: React.FC = () => {
  return (
    <Html lang="ja">
      <Head>
        <link rel="preload" as="image" href="/icon.webp" />
        <link rel="preload" as="image" href="/icon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="icon-152x152.png" />
        <meta name="theme-color" content="#009688" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
