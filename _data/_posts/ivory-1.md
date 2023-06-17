---
layout:      post
title:       React×Electron×TypeScriptの環境設計【Ivory開発日誌1】
author:      sa2taka
category:    ivory
tags:        React ,Electron,TypeScript,Ivory,Mastodon
public:      true
createdAt:   2020-05-22
updatedAt:   2020-06-25
latex:       undefined
description:
  マストドンクライアントを作ろう。そう思い立った翌日に、彼は荒野の中にいた。――Electronの環境構築って、案外面倒くさいんだな。彼は呟きながら、徹夜明けの耳に鳥の囀りを聞いた  
---

ハローワールド

マストドンクライアントを作ろう。

思い立ったが吉日、といいますので、本日からElectron×Reactを利用して作成していこう、と決めました。それに付随して本日から開発日記をつけて行きたいと思います。できれば一週間に一度程度は書ければいいかな、と思っています。

名前は「ivory」。実は昔Ruby用のMastodonライブラリにつけた名前と一緒ですが、思いつかなかったので、気づかなかったふりをしてください。

# 作成環境

```
Microsoft Windows [Version 10.0.18362.836]
(c) 2019 Microsoft Corporation. All rights reserved.

C:\Users\sa2taka>node -v
v12.16.3

C:\Users\sa2taka>yarn -v
1.22.4
```

最初はWSLで作ろうと思ったんですが、ElectronをWSLとかバリだるすぎるのでやめました（実際は途中までやってた）。


# プロジェクトの作成

今回はcreate-react-appを使わずに1からやっていきます。

まずは適当にフォルダを作って`yarn init`。このとき、`entry`のポイントを`dist/main.js`としておくと、electronでの実行が便利になります。

それ以外は適当にデフォルトとかで良いと思います。

``` bash
$ yarn init
...
question entry point (index.js): dist/main.js
...
```

完成した`package.json`に`scripts`の欄を作って埋めていきましょう。とりあえず、今回の記事で使う分です。

```json:package.json
{
...
  "main": "dist/main.js",
...
  "scripts": {
    "start": "electron .",
    "build": "webpack"
  }
}
```

# 主要ライブラリ達のインストール

今回の主役たちと、開発において縁の下の力持ちの役割をもつlint系とwebpack系をインストールします。

```bash
# reactのインストール
$  yarn add react react-dom
# 本日の主役達のインストール
$ yarn add -D electron typescript
# 設定関連のインストール
$ yarn add -D eslint prettier eslint-config-prettier webpack webpack-cli ts-loader
# lint関連のインストール
$ yarn add -D eslint-plugin-react eslint-plugin-prettier babel-eslint
# typeのインストール。electronは不要
$ yarn add -D @types/react @types/react-dom
```

# lintの設定

次にlintの設定をします。`eslintrc.json`と`prettierrc`を設定します。特にprintWidthとかお気に入りな値にしてください。


```json:.eslintrc.json
{
  "env": {
    "commonjs": true,
    "es2020": true,
    "node": true,
    "browser": true
  },
  "parser": "babel-eslint",
  "plugins": ["react", "prettier"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "prettier/react"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

```json:.prettierrc
{
  "printWidth": 80,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "endOfLine": "auto"
}

```

# TypeScriptの設定

次にTypeScriptの設定です。下記コマンドで`tsconfig.json`を作りましょう。

```bash
$ yarn tsc --init
```

1から作ってもいいですが、今回は`create-react-app`環境で作られるtsconfig.tsからパクってきましょう。ただし、一部改変してます。

```json:tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react"
  },
  "include": [
    "src"
  ]
}
```

僕の手元の`create-react-app`製の`tsconfig.ts`では`noEmit: true`が入っていました。なんででしょうか[^noEmit-true]。

[^noEmit-true]: tscで--noEmitオプションを指定すると出力せずに、型チェックだけを行います。webpackのts-loaderで型チェックを行わずにビルドを早くしつつ、tscで型チェックを行う、という使い方はよくある方式です。が、なんでtsconfig.tsにnoEmitオプションが付いているのでしょうか

# Webpackの設定

次にwebpackの設定です。下記は、[後ほど](#Electronの設定)大きく変わりますので、あまり本章は気にしないでください。

```typescript:webpack.config.ts
const path = require('path');

module.exports = {
  mode: 'development',
  entry: `${__dirname}/src/main.ts`,
  output: {
    path: `${__dirname}/dist`,
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
```

```typescript:src/main.ts
console.log('hello world');
```

```bash
$ yarn webpack-cli
```

ここまでやれば、とりあえずTypeScriptのWebpack環境が完成します。

## eslint-loaderの設定

おまけ程度にeslint-loaderの設定をします。ビルド時にeslintもやってくれるやつです。

```bash
$ yarn add -D eslint-loader
```

```typescript:webpack.config.ts
module: {
  rules: [
+    {
+      test: /\.tsx?$/,
+      enforce: 'pre',
+      loader: 'eslint-loader',
+    },
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
    },
  ],
},
```

# index.htmlの設定

Electronに表示するhtmlを作成します。
今回はpublicフォルダを作ってその中に突っ込みました。中身はとりあえず適当でいいと思います。

```html:public/index.html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Ivory</title>
  </head>

  <body>
    <div id="app"></div>
  </body>
</html>
```

# Electronの設定

Electronを実行するmain.tsを作成しましょう。
Electronではアプリケーションを司るmainとそれぞれのページの表示を司るrendererに分かれていますが、これはmainの方の記述ですね。

``` typescript:main.ts
import { app, BrowserWindow } from 'electron';

const root = `file://${__dirname}`;
const index = `${root}/index.html`;

function createWindow() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile(index);
}

app.whenReady().then(createWindow);
```

## 実行、しかし...

実行してみると、エラーに..。

```
$ yarn build
$ yarn start
App threw an error during load
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```
このエラーで夜が潰れました。
ゆっくりとスタックトレースと実際のビルド後のソースを読んでいたら、非常に単純なことがわかりました。

1. webpackは依存関係すべてのファイルをバンドルする
2. 当然electronもバンドルする
3. そこで下記のようなバンドルファイルが出来上がる

```javascript:main.js
...
/***/ "./node_modules/electron/index.js":
/*!****************************************!*\
  !*** ./node_modules/electron/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/*中略*/var pathFile = path.join(__dirname, 'path.txt'/*略*/
...
```
4. ここにある`var pathFile`をファイルパスとして、fs.existsSyncを利用してファイルの存在確認をしている。ただ、`main.js`の__dirnameは`<ソースパス>/dist`であり、`<ソースパス>/dist/path.txt`は当然存在しない。
5. パスが存在しない場合、インストールしてくれ、という文言が出るようになっている。つまり、今回はwebpackでまとめたせいでこのエラーが起きている


## 解決方法

[Webpack公式](https://webpack.js.org/concepts/targets/)でelectron用のtargetがあった。

なので、こんな感じのwebpackのコンフィグを設定してみた。

```typescript:webpack/webpack.main.ts
const path = require('path');

module.exports = {
  target: 'electron-main',
  mode: 'development',
  entry: path.resolve(__dirname, '../src/main.ts'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'main.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
```

```typescript:webpack/webpack.renderer.ts
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  mode: 'development',
  entry: path.resolve(__dirname, '../src/renderer.ts'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'renderer.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: [/node_modules/],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
    }),
  ],
};
```

```typescript:webpack.config.ts
const main = require('./webpack/webpack.main.ts');
const renderer = require('./webpack/webpack.renderer.ts');

module.exports = [main, renderer];
```

```
$ yarn build
$ yarn start
```

![empty electron](https://i.imgur.com/xsacL4I.png)


まだ何も設定してないので空のままですね。

ここまで記載して、朝の4時。不安の残るスタートとなった。
