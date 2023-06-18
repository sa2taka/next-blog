---
layout:      post
title:       Tailwind.cssをReactの環境にインストール[Ivory開発日誌2日目]
author:      sa2taka
category:    ivory
tags:        tailwind.css,ivory
public:      true
createdAt:   2020-05-31
updatedAt:   2020-05-31
latex:       undefined
description:
  ReactのUIフレームワークに対して今ひとつ最適解を選べないとっぷらは、Tailwind.cssを利用することにした。これは、その時の記録……。  
---

ハローワールド。

最近Rustをやったり、ブログのソースを魔改造しまくったり、新しいゲームを2本も買ってしまったりと何かとIvoryプロジェクトが開始早々頓挫していますが2日目です。

[1日目ではプロジェクトを開始しました](/post/ivory-1)。

本日はCSSフレームワークの設定をします。
ReactにはVuetify程（僕に）刺さるUIコンポーネントフレームワークがないので、正直利用するたびに変わります。

なので、今回は[tailwind.css](https://tailwindcss.com/)を利用しようと思います。

# Tailwind CSS
tailwind.cssのコアコンピタンスには[Utilify First](https://tailwindcss.com/docs/utility-first)といったものがあります。

少し話はそれますが、tailwind.cssの作者は[CSSユーティリティクラスと「関心の分離」](https://yuheiy.hatenablog.com/entry/2020/05/25/021342)（リンク先記事は日本語訳記事）というタイトルでCSSとHTMLの分離についての考え方を述べています。
HTML5になり、よりセマンティックなマークアップとCSSによるデザインを分けるためには、という「関心の分離」について議論が重ねられている分野においての1つの回答ですが、非常にタメになる考え方でした。

私もBEMなどよりはこちらのほうが好きなので非常に興味がそそられたのと、UIフレームワークに頼らないデザインを作成したいという感情が現れたので今回はtailwind.cssを採用することになりました。

# Tailwind CSSのインストール

[インストール](https://tailwindcss.com/docs/installation)を参照にインストールしていきます。

```bash
$ yarn add -D tailwindcss postcss-cli autoprefixer css-loader style-loader postcss-loader
$ yarn tailwind init
```

まず`postcss.config.js`を作成して設定するだけします。

```javascript:postcss.config.js
module.exports = {
  plugins: [require('tailwindcss'), require('autoprefixer')],
};

```

次にwebpackの設定をします。Electronの場合は`webpack.renderer.ts`(rendererの方のwebpack.config.ts)に設定をします。

```typescript:webpack.renderer.ts
module: {
  rules:[
    // ...
    {
      test: /\.s?css$/,
      use: [
       'style-loader',
       { loader: 'css-loader', options: { importLoaders: 1 } },
       'postcss-loader',
      ],
    },
    // ...
  ]
}

```

次にtailwind.cssを作成します。これに関してはどこに作ってもいいですが、今回は`src/style/tailwind.css`を作成しました。

```css:src/style/tailwind.css
@tailwind base;
@tailwind components;
@tailwind utilities;

```

最後にrenderer.tsx（redererのentryファイル）を下記のようにします[^atmark]。

[^atmark]: `import '@/style/tailwind.css';`となっていますが、これはwebpackのresolve機能を利用しています。create-react-appとかだと利用できないみたいですが、設定自体は簡単なのでやってみてください。

```typescript:renderer.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import '@/style/tailwind.css';

const app = document.getElementById('app');

ReactDOM.render(<p className="text-6xl">Hello, World!</p>, app);

```

後はビルドして開くだけ。

![big size hello world](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/big%20size%20hello%20world.png)

`text-6xl`クラスはtailwind.cssのクラスの1つで、文字の大きさをすげぇでかくしてくれます。tailwind.cssがインストールできましたね。

短いですが、本日はここまで。次はReactよくばりセット、Storybookとテストフレームワーク（jestの予定）のセットアップを行う予定です。
