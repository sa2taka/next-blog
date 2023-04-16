---
layout:      post
title:       ESBuildでビルドしてGoogle Cloud Functionで実行するまで
author:      sa2taka
category:    typescript
tags:        esbuild,javascript,typescript,google-cloud-function
public:      true
createdAt:   2020-06-23
updatedAt:   2020-06-23
latex:       undefined
description:
  話題のバンドラ、ESBuildでビルドして、Google Cloud Functionで実行してみました。  
---

ハローワールド

[ESBuild](https://github.com/evanw/esbuild)はここ最近で注目されているバンドラー[^bundler]の一つです。

Go製のバンドラーであり、特に**高速であること**を特徴にしています。上記Githubの公式ページから画像を引用しますが、他と比べると**100倍以上のスピード**でビルドされることがわかります。

![ESBuildの速度](https://i.imgur.com/0uTVNNK.png)

2020/6/23の時点で「v0.5.11」と、まだ発展途上のライブラリですが、今回はGoogle Cloud FunctionでESBuildでビルドしたものを実行してみました。

# セットアップ

今回はESBuild × TypeScriptでやってみます。特に設定をせずともTypeScriptが動くのが嬉しいですね(とは言っても、型チェックはしないので、別途tscは必要です)。

というわけでセットアップしていきましょう。

```bash
$ mkdir esbuild-gcloud-functions-test
$ cd esbuild-gcloud-functions-test
$ yarn init
$ yarn add -D esbuild typescript
```

今回は[GCPのドキュメント](https://cloud.google.com/functions/docs/writing/http?hl=ja)にあるコードをdeployします。ただし、書き方はモダンっぽく。

```typescript:src/index.ts
import { Request, Response } from 'express';
import escapeHtml from 'escape-html';

export function helloHttp(req: Request, res: Response) {
  res.send(`Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);
}
```

expressのtype他が必要なので追加しておきます。型を見ないので型関連は不必要ですが。

```bash
yarn add -D express @types/express @types/escape-html
```

# ビルド

というわけで、esbuildでビルドしていきます。今回は下記の条件でビルドしていきます

- 実行環境はnodeである
- 一応targetはesnextで
- GCFはcommonjs形式である(多分)

上記のコードはES6形式でモジュールを書いていますが、GCFは`exports.functionName = ...`で記載するcommonjs形式である必要があります(多分)。

上記を踏まえてビルドコマンドは下記のようになります。

```bash
$ yarn esbuild --bundle --outdir=dist --minify --sourcemap --format=cjs --platform=node src/index.ts 
```

上記コマンドのオプションを説明していきます。

- --bundle
`--bundle`はその名の通り、依存関係を解決し必要なモジュールを「まとめて」くれます。GCFでやる場合は必要ないのかもしれませんが、後術の`format=cjs`を利用する場合は必須です。
- --outdir
`--outdir`はその名の通り、出力フォルダです。今回のビルド結果を今回は`dist`に保存してくれます。
- --minify
`--minify`はその名の通り、minify化してくれます。特に意味はないですが、付けてます。
- --sourcemap
`--sourcemap`はいわゆるsourcemapを作ってくれます。
- --format
`--format`は出力先のモジュール形式を選べます。`iief`(即時実行関数式)、`esm`(ES6 Module)、`cjs`(Common JS形式)のいずれかを選べます。今回はCommon JSです
- --platform
`--platform`は実行するプラットフォームを選択します。`brwoser`または`node`のどちらかを選べ、今回は`node`です。
- src/index.js
ビルドのソースとなるファイルです。

では実際にやってみましょう。

``` bash
$ yarn esbuild --bundle --outdir=dist --minify --sourcemap --format=cjs --platform=node src/index.ts 
yarn run v1.21.1
$ .../esbuild-gcloud-functions-test/node_modules/.bin/esbuild --bundle --outdir=dist --minify --sourcemap --format=cjs --platform=node src/index.ts
Done in 0.31s.
```

**0.31sでビルドができました**(後でwebpackと比較します)。

# デプロイ

`gcloud`コマンドでデプロイしていきましょう。

```bash
$ gcloud functions deploy test --entry-point helloHttp --runtime nodejs12 --trigger-http --region asia-northeast1 --source dist
```

`gcloud`の詳細は別途調べてください(放棄)。

しばらくするとデプロイが完了します。今回は`--triger-http`を利用しているので、httpで関数を呼び出すことが可能です。呼んでみましょう。

![Hello sa2taka](https://i.imgur.com/2vASigY.png)
※ URLは実在しません

というわけで実際に動くのが確認できました。

# 比較

今回はwebpackで似たような出力になるような設定で実行していました。全く同じではないと思われますので、あくまでご参考に。

まずwebpackの追加と下記のようなwebpack設定ファイルを作成します。

```bash
$ yarn add -D webpack webpack-cli
```

```typescript:webpack.config.ts
const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    path: path.resolve(__dirname, './dist-webpack'),
    filename: 'index.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
```

ts-loaderが必要なので追加しましょう。

```bash
$ yarn add -D ts-loader
```

次に、ts-loader用のtsconfigを初期化しましょう。

```bash
$ tsc init
```

設定はこんなので大丈夫でしょう。

```json:tsconfig.json
{
  "compilerOptions": {
    "target": "esnext", /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */
    "module": "commonjs", /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */
    "sourceMap": true, /* Generates corresponding '.map' file. */
    "strict": true, /* Enable all strict type-checking options. */
    "esModuleInterop": true, /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
    "forceConsistentCasingInFileNames": true /* Disallow inconsistently-cased references to the same file. */
  }
}
```

ではビルド。

```bash
$ yarn webpack
yarn run v1.21.1
$ .../esbuild-gcloud-functions-test/node_modules/.bin/webpack
Hash: ee741af20bd9fc187fae
Version: webpack 4.43.0
Time: 2997ms
Built at: 06/23/2020 9:52:05 PM
       Asset      Size  Chunks                   Chunk Names
    index.js  1.75 KiB       0  [emitted]        main
index.js.map  6.98 KiB       0  [emitted] [dev]  main
Entrypoint main = index.js index.js.map
[0] ./src/index.ts 464 bytes {0} [built]
    + 1 hidden module
Done in 11.36s.
```

11.36s。esbuildの0.31sと比べると、想像以上になげぇ...


## 型チェックを除く

ですが、ts-loaderは型チェックもやってくれる優秀な子です。esbuildでは型チェックを行わないので、ts-loaderも型チェックをしないようにしてみましょう。

```typescript:webpack.config.ts
// ...
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
            }
        }
// ...
```

ではビルド。

```bash
$ yarn webpack
yarn run v1.21.1
$ .../esbuild-gcloud-functions-test/node_modules/.bin/webpack
Hash: 607a2eecc22c1c584a3c
Version: webpack 4.43.0
Time: 888ms
Built at: 06/23/2020 10:03:59 PM
       Asset      Size  Chunks                   Chunk Names
    index.js  1.75 KiB       0  [emitted]        main
index.js.map  6.98 KiB       0  [emitted] [dev]  main
Entrypoint main = index.js index.js.map
[0] ./src/index.ts 464 bytes {0} [built]
    + 1 hidden module
Done in 8.34s.
```

それでも8.34sかかるみたいですね...。

[^bundler]:JavaScriptでは複数のモジュールや依存解決を解決し、一つ、または機能単位にまとめるツールのことで、Webpackが代表的なツールの一つです。

## ファイル容量

ではファイル容量ではどうでしょうか。

```bash
 $ ls -l dist
total 8
-rwxrwxrwx 1 sa2taka sa2taka  961 Jun 23 21:30 index.js*
-rwxrwxrwx 1 sa2taka sa2taka 2358 Jun 23 21:30 index.js.map*
 
$ ls -l dist-webpack/
total 12
-rwxrwxrwx 1 sa2taka sa2taka 1788 Jun 23 22:03 index.js*
-rwxrwxrwx 1 sa2taka sa2taka 7143 Jun 23 22:03 index.js.map*
```

倍ぐらい差が...ついてますね。

# 簡単なまとめ

今回はesbuildというツールを利用して、google cloud funtionにアップロードできる形式のファイルをビルドしてみました。またwebpackとの比較を行いました。

今回のwebpackとの比較の結果は
- 速度は**20倍以上**
- ファイルサイズも**半分程度**

と、中々パワフルな結果を残してくれました。

もちろん一朝一夕でwebpackに取って代われる程に強くはなく、エコシステムもまだまだ貧弱ですが、今後注目していきたいツールの一つには違いがないようです。

最後に、上記のプログラムは[Githubにアップロード](https://github.com/sa2taka/esbuild-gcloud-functions-test)しました。ブログ記載以上のことは書いていないですが、試したい場合などはご利用ください。
