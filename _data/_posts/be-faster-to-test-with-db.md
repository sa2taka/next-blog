---
layout:      post
title:       （条件に合えば）ぱぱっとテストを高速にできる2つの方法
category:    programming
author:      sa2taka
tags:        test
public:      true
createdAt:   2026-08-18
updatedAt:   2026-08-18
latex:       false
description:
   無駄に凝ったことをしているとかせず、簡単な設定変更でテストを高速化したので、その時のメモです。条件に合えば。
---

テストで使うDBの設定と、あとはDOMのテストで`jsdom`の有効範囲を減らすことで、結構減らすことができたので、その時のメモです。

前提として、JavaScriptのテストフレームワークvitestを利用しています。がDBの設定はどのような環境でも利用できるでしょう。

# DBの設定による速度の向上

私は[読みやすいテストコードのために心がけること](/post/readable-test-code-2024/)で記載しているように、テストは可能な限り動作環境に近い状態で実行することを推奨しています。そのため、もしfirestoreを利用しているならfirestoreのエミュレーターを使いますし、RDBを使うならDockerにPostgreSQLを立てて、それを利用してテストを書きます。
ただそうなると、テストの実行時間が長くなります。モックを使うのと比べると実際のアクセス時間もかかりますし、DBインスタンスが1つしかないのであればテストを並列で実行するのは困難でしょう。Testcontainersなどに代表されるような軽量なDBなどテストWorkerごとにDBを立ち上げるという手法もありますが、それでもテストの実行時間は長くなります。

私自身はCIに速度は求めておらず、どちらかといえば確実性やメンテナンス性を求めます。つまりどういうことかというと、テストごとにDBのテーブルのデータを全削除します。さすがにマイグレーションからはやりませんが。テストケースが1,000個あると、1,000回のリセットが発生します。1つ1つは100msでも、1,000回だと100秒です。

一般的にシステムで使うようなRDBはかなりの完全性を担保しています。そのためには幾分かのオーバーヘッドが発生します。ですが、テストで使う程度ならそんな完全性は基本的に不要です。そのため、テスト用のDBの設定を変更することで、テストの実行時間を短縮できます。

## `fsync` の無効化

`fsync` はOSのシステムコールで、メモリ上のデータをディスクに書き込むことを保証するものです。PostgreSQLの設定項目にも存在し、有効化すると更新を確実にディスクに保存するまで待ってくれます。

ref：https://www.postgresql.jp/docs/9.4/runtime-config-wal.html#:~:text=%E8%A8%80%E3%81%88%E3%81%BE%E3%81%99%E3%80%82-,fsync,-(boolean)

一方で、テスト用のDBでそんな待つ必要もないので無効化します。この無効化だけで、**450sのテストが102sまで短縮されました**。俺のテスト、DBのアクセスばっかじゃん。

MySQLは詳しくないですが、MySQLにも[しきい値の設定](https://dev.mysql.com/doc/refman/8.0/ja/optimizing-innodb-diskio.html)などもあるようなので、これを活用することで高速にできるかもしれません。

## `synchronous_commit` の無効化

下記のPostgreSQLのドキュメントのとおり、fsyncとほぼ同じような意味合いのもので、fsyncが無効化されている場合はあまり意味がないかもしれませんが、目についたので無効化しています。正直そこまで変わってないです。

ref：https://www.postgresql.jp/docs/9.4/runtime-config-wal.html#:~:text=%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82-,synchronous_commit,-(enum)

## `full_page_writes` の無効化

PostgreSQLでは一定時間かWALが一定量溜まるときに処理があります。細かい説明を省くとこの際の処理についてですが、これもそこまで効果がある設定ではないです。

ref：https://www.postgresql.jp/docs/9.4/runtime-config-wal.html#:~:text=%E8%A8%AD%E5%AE%9A%E5%8F%AF%E8%83%BD%E3%81%A7%E3%81%99%E3%80%82-,full_page_writes,-(boolean)

## 意外に`fsync`の効果はデカい

ディスクに書き込むのを待つというのは、1個1個は短いですが、塵も積もればなんとやらで非常に大きくなります。特にCI環境ではディスクの速度が相対的に遅いこともあるでしょうし、これを入れるだけで大幅に短縮される可能性があります。

# `jsdom`の有効範囲を減らすことによる速度の向上

今度は場所を変えてフロントエンドに関するテストです。

メインの説明の前に、こと`vitest`においては実行時にテストの実行時間の内訳が記載されます。

```
Duration  481.71s (transform 2.82s, setup 61.03s, import 103.58s, tests 182.93s, environment 108.97s)
```

それぞれに意味があり、 testsはテストの実行の本体で、まぁこれに時間がかかるのはしょうがないですが、それ以外にも結構時間がかかっているケースがあります。今回はこの `environment` について。こいつも108.97sと時間がかかっていますね。

こいつは何かというと、まぁその名のとおり `environment` ですね。`vitest.config.ts` を見てみると、次のような定義になっていました。

```typescript:vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    pool: "forks",
    maxWorkers: 1,
    isolate: true,
    reporters: process.env.GITHUB_ACTIONS ? ["dot", "github-actions"] : ["dot"],
    restoreMocks: true,
    mockReset: true,
    env: result.parsed,
    testTimeout: 60000,
  },
  esbuild: {
    target: "es2022",
  },
});
```

この中の `environment: "jsdom"` がenvironmentですね。

さてこの`environment`ですが、テスト「ファイル」単位に初期化されます。そして、[JSDom](https://github.com/jsdom/jsdom)というのはDOMのテストを行う仮想的なブラウザ環境を提供するものです。そうなると、初期化も時間がかかりそうですね。ですが、全てのテストにDOMが必要とは限りません。その辺の文字列変換や時刻のフォーマットには不要ですよね。そのため、DOMが必要なテストファイルだけに`jsdom`を有効化することで、テストの実行時間を短縮できます。

例えば次のように設定を変更します。

```typescript:vitest.config.ts
const domTestGlobs = [
  "__tests__/**/*.test.tsx", // React コンポーネントは基本 .tsx
  "__tests__/**/use-*.ts", // そのほか、renderHook を使う一部tsでも必要
];

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    pool: "forks",
    maxWorkers: 1,
    isolate: true,
    // ...
    projects: [
      { extends: true, test: { name: "node", environment: "node", exclude: [...domTestGlobs] } },
      { extends: true, test: { name: "dom", environment: "jsdom", include: domTestGlobs } },
    ],
  },
});
```

これをすれば、DOMが必要なテストは`jsdom`を有効化し、それ以外のテストは`node`環境で実行されます。これだけでenvironmentの**50%程度の時間を削減できました**。DOMが必要なテストファイルが少なかったからというのもありますが。なのでDOMが必要なテストファイルが多いような大規模なフロントエンドではこれだけではなく、[happy-dom](https://github.com/capricorn86/happy-dom)のような軽量なDOM環境を使うなどの工夫も必要でしょう。APIが一部足りないらしいですが。
