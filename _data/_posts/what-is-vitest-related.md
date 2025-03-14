---
layout:      post
title:       Vitestのrelated/JestのfindRelatedTestsを深ぼる
category:    memo
author:      sa2taka
tags:        vitest,jest
public:      true
createdAt:   2025-02-20
updatedAt:   2025-02-20
latex:       false
description:
   Vitestのrelatedは、対象ファイルに関連するテストを実行できます。この関連ファイルはおそらく依存関係を利用して取得していると思いますが、どうやっているか気になり調べました。
---

[vitest related](https://vitest.dev/guide/cli#vitest-related)はVitestの命令の1つです。指定したファイルに関連するテストを自動で実行してくれます。Jestでも[--findRelatedTests](https://jestjs.io/ja/docs/cli#--findrelatedtests-spaceseparatedlistofsourcefiles)というオプションで同様の動作ができます。

これは特定のファイルの依存を色々確認できるということです。どうやって依存を取得しているかを深ぼれば面白そうだったので、調べてみました。

---

とりあえず上記のサブコマンドのエントリーポイントまで愚直に見ていきます。

まずは `package.json` の `bin` を見ると `vitest.mjs` となっています。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/package.json#L106-L108

`vitest.mjs` はシンプルに `./dist/cli.js` を読み込んでいます。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/vitest.mjs

vitestの設定を見ると`rollup`を使ってビルドをしているので、`rollup.config.js`を確認すると、おそらく`src/node/cli.ts`が実際の処理になっていそうです。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/rollup.config.js#L21

で、最終的に`src/node/cli/cac.ts`に行き着きます。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/src/node/cli.ts

[cac](https://www.npmjs.com/package/cac)はCLIアプリのフレームワーク的なものですね。

`related`のサブコマンドの定義は `runRelated` を呼び出す様になっており。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/src/node/cli/cac.ts#L162-L164

`runRelated` は下記のような定義です。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/src/node/cli/cac.ts#L229-L233

つまりは、 `argv.related` にファイル情報を入れている状態で、 `start`関数を呼び出している事がわかります。`start`も同ファイルに定義されており、`src/node/cli/cli-api.ts`の`startVitest`関数を呼び出す様になっています。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/src/node/cli/cac.ts#L270-L295

---

上記のファイルを追いかけると最終的に `src/node/core.ts` にたどり着きます。名前からしても重要そうですね。

`start` といういかにもなメソッドがあるためそれを読んでいきます。おそらく対象のファイルを取得する処理があります。`this.specifications.getRelevantTestSpecifications`です。

https://github.com/vitest-dev/vitest/blob/d5765f71b3d269cb2d3a06666a5070372e21e62e/packages/vitest/src/node/core.ts#L543-L553

該当の処理は`filterTestsBySource`を呼んでいるだけです。

https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/specifications.ts#L35-L39

そちらの処理を見ると、`config.related`を利用している部分があります。

https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/specifications.ts#L122-L166

下記の処理が関連ファイルかどうかを判定しているものっぽいですね。 `getTestDependencies` て該当のファイルの依存関係を取得し、その依存関係の中に関連ファイルのファイルがあるかどうかを判定している様です。

https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/specifications.ts#L152-L166

`getTestDependencies` は下記のような処理です。

https://github.com/vitest-dev/vitest/blob/2923c9a7acb071f045bc183e5f24d0d7064ccd33/packages/vitest/src/node/specifications.ts#L171-L198

`project.vite.moduleGraph.getModuleById` と `project.vitenode.transformRequest` というメソッドが気になりますね。これらのAPIを利用すれば依存関係がいい感じに取得できそうです。

---

まずは `project.vite` を見てみます。`vite`は `ViteDevServer` という`vite`側のインスタンスを持っているようです。Viteではおなじみの `createDevServer` で得られるインスタンスですね。[Viteのドキュメント](https://github.com/vitejs/vite/blob/main/docs/guide/api-javascript.md)でも説明されています。

`moduleGraph`は下記のような説明となっています。

> Module graph that tracks the import relationships, url to file mapping and hmr state.
> > インポート関係、urlとファイルのマッピング、hmrの状態を追跡するモジュールグラフ。
```
 /**
   * Module graph that tracks the import relationships, url to file mapping
   * and hmr state.
   */
  moduleGraph: ModuleGraph
```

まぁ名前のとおりではありますが、モジュールのグラフを追跡できるものですね。

---

`transformRequest`を確認してみます。

検索してみると下記にたどり着きます。

https://github.com/vitejs/vite/blob/b12911edba0cd9edbad170a0940d37bb1e16ef2c/packages/vite/src/node/server/transformRequest.ts#L67

コードを読んでみると最終的には`moduleGraph`が登場します。戻り値に`deps`や`dynamicDeps`がありますしね。

---

まとめると、viteの内部的には該当のファイル（モジュール）の依存を追う`deps`なり`dynamicDeps`という物があり、それを利用して依存しているファイルを確認し自動でテストを実行しているようです。
