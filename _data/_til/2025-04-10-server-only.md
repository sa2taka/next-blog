---
layout:      til
title:       server-only パッケージをインポートしたやつをどうにかして動かす
category:    react
createdAt:   2025-04-10
updatedAt:   2025-04-10
---

ReactやNext.jsにおいて、`server-only` というパッケージをimportすることで、該当のパッケージをインポートした処理はServer側の処理からのみインポート可能になります。つまり `use client` などをつけたコンポーネントからは利用できません。逆に`client-only`というのもありますね。詳細は[Next.jsの記事](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment)などが参照になります。

例えばなのですが運用で使うスクリプトを実行する時に、`server-only`パッケージをインポートしているライブラリが依存に入ってしまっていると、下記のエラーが発生してしまいます。これをどうにかしようという話です。

```
Error: This module cannot be imported from a Client Component module. It should only be used from a Server Component.
```

結論からすると`node`に`--conditions=react-server`という**オプションを付与して実行することで解決します**。`node`以外で実行する場合、例えば`tsx`等の場合は`NODE_OPTIONS='--conditions=react-server'`などで代替可能です。

# 深堀り

server-onlyの仕組みは下記の記事が詳しいです。

https://quramy.medium.com/server-component-%E3%81%A8-client-component-%E3%81%A7%E4%BE%9D%E5%AD%98%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%82%92%E5%88%87%E3%82%8A%E6%9B%BF%E3%81%88%E3%82%8B-7d65c8b2074f

重要なのはnodeの[subpath imports](https://nodejs.org/api/packages.html#subpath-imports)という機能です。その中でも[Conditional exports](https://nodejs.org/api/packages.html#conditional-exports)という機能が重要です。

`server-only` の `package.json` を見ると下記のような定義がされています。`server-only`自体はGitHubで見つからないので、node_modulesの中から引っ張ってきています。

```json
{
  // ...
  "exports": {
    ".": {
      "react-server": "./empty.js",
      "default": "./index.js"
    }
  }
}
```

`default`というのは条件に引っかからなかった時のデフォルトの挙動です。つまり`react-server`という何らかしらの条件に引っかかる場合は`empty.js`が、そうではない場合は`default`が呼ばれます。
ちなみに`empty.js`は文字通り空っぽで、`index.js`はエラーを吐くだけのファイルです。

```javascript:empty.js
```

```javascript:index.js
throw new Error(
  "This module cannot be imported from a Client Component module. " +
    "It should only be used from a Server Component."
);
```


上記を見るに、`react-server`という条件であれば**問題なくインポートできる**ようです。この条件を指定するのが[`--conditions`オプション](https://nodejs.org/api/cli.html#-c-condition---conditionscondition)です。`node --conditions=react-server` のようなコマンドを打つことで、`server-only`の挙動を変更でき、動かすことが可能です。
