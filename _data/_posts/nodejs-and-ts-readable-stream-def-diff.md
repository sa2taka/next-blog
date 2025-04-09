---
layout:      post
title:       Node.js(の@types)とTypeScript(lib.dom.ts)でReadableStreamの型定義が違う
category:    typescript
author:      sa2taka
tags:        typescript
public:      true
createdAt:   2025-04-09
updatedAt:   2025-04-09
latex:       false
description:
   Node.jsの@typesとTypeScriptのlib.dom.tsとで、ReadableStreamの型定義の互換性がなく、少し調べると結構面白かったのでログとして残しておきます。
---

（一昔前の）Node.jsといえばStream。そんなStreamも今ではWHATWGのよる[Web Standards](https://developer.mozilla.org/ja/docs/Web/API/Streams_API)として各ブラウザにStream APIが生えています。Node.jsのReadableなStreamをWeb StandardsのReadableStreamに変換するには[Stream.Readable.toWeb](https://nodejs.org/api/stream.html#streamreadabletowebstreamreadable-options)という静的メソッドを利用することで変換できます。

型定義に関しては、Web Standardsにもなっていますので当然TypeScriptのlid.dom.tsに型定義があります。Node.jsはNode.jsで自前で[@types/nodeの型定義](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node)を配布していて、自前のWeb版のReadableStreamの型定義があります。ここで本題。これら**Node.jsとTypeScriptの2つの型に互換性がありません**。
例えば次のようなコードを書いて`tsc`でビルドしてみます[^lib-definition]。

[^lib-definition]: `tsconfig.json` の `lib` は特に設定無しで行っています。

```typescript:index.ts
import Stream from "node:stream";
import { ReadableStream as nodejs_ReadableStream } from "node:stream/web"

const nodejsReadable = Stream.Readable.from("Hello World");
const convertedToNodejs: nodejs_ReadableStream= Stream.Readable.toWeb(nodejsReadable);
const convertedToLibDomJs: ReadableStream = Stream.Readable.toWeb(nodejsReadable);
```

当然`convertedToNodejs`はNode.js内部での型変換なので問題ないですが、TypeScript側の型へ代入する部分では型エラーが発生します。

```
index.ts:6:7 - error TS2322: Type 'import("stream/web").ReadableStream<any>' is not assignable to type 'ReadableStream<any>'.
  Types of property 'pipeThrough' are incompatible.
    Type '<T>(transform: import("stream/web").ReadableWritablePair<T, any>, options?: import("stream/web").StreamPipeOptions | undefined) => import("stream/web").ReadableStream<T>' is not assignable to type '<T>(transform: ReadableWritablePair<T, any>, options?: StreamPipeOptions | undefined) => ReadableStream<T>'.
      Types of parameters 'transform' and 'transform' are incompatible.
        Type 'ReadableWritablePair<T, any>' is not assignable to type 'ReadableWritablePair<T | undefined, any>'.
          Types of property 'readable' are incompatible.
            Type 'ReadableStream<T>' is missing the following properties from type 'ReadableStream<T | undefined>': values, [Symbol.asyncIterator]

6 const convertedToLibDomJs: ReadableStream  = Stream.Readable.toWeb(nodejsReadable)
```

上記の型定義を紐解いていきます。

以降、バージョンは `@types/node` が `22.14.0`、`typescript` が `5.8.3` となっています。

ちなみに結論としては**この型エラーはどうしようもないので、型アサーション等で対応しましょう**。型アサーションで特筆するほどの問題は発生しないはずです。**[Issue](https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542)も立っていたりします**。


# 型定義の差分

tscでビルドを実行して、型エラーをヒントにlid.dom.tsと@types/nodeの定義を目grepする旅に出ました。下記が差分です。

続いて、`ReadableStreamGenericReader` および `WritableStreamDefaultWriter` の型定義に多少のズレがあります。`closed` や `ready` の戻り値が、Node.jsだと `Promise<undefined>`、TypeScriptだと `Promise<void>` となっています。

`ReadableStreamGenericReader`の定義は下記の通り。

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1f6ca6ff73af20b951f5ea6ecbea6668eff1750f/types/node/stream/web.d.ts#L99-L102

https://github.com/microsoft/TypeScript/blob/83dc0bb2ed91fe0815ab28dc3ff95fae7425e413/src/lib/dom.generated.d.ts#L19634-L19639

`WritableStreamDefaultWriter`の定義は下記の通り。

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1f6ca6ff73af20b951f5ea6ecbea6668eff1750f/types/node/stream/web.d.ts#L309-L317

https://github.com/microsoft/TypeScript/blob/83dc0bb2ed91fe0815ab28dc3ff95fae7425e413/src/lib/dom.generated.d.ts#L27390-L27405

その他、下記のように差分があったりします。

`ReadableStream`に `values` および `Symbol.asyncIterator` の有無があります。ちなみに、これは `DOM.AsyncIterable` を `tsconfig.json` の `lib` にいれるとTypeScriptに生えます。

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1f6ca6ff73af20b951f5ea6ecbea6668eff1750f/types/node/stream/web.d.ts#L173-L184

https://github.com/microsoft/TypeScript/blob/83dc0bb2ed91fe0815ab28dc3ff95fae7425e413/src/lib/dom.generated.d.ts#L19552-L19567

`ReadableStreamBYOBReader`についての差分。こちらは型エラーになりません。

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1f6ca6ff73af20b951f5ea6ecbea6668eff1750f/types/node/stream/web.d.ts#L206-L216

https://github.com/microsoft/TypeScript/blob/83dc0bb2ed91fe0815ab28dc3ff95fae7425e413/src/lib/dom.generated.d.ts#L19577-L19582

上記でNode.jsの型をほぼTypeScriptと同じにしたんですが、なぜか全然型エラーが治らない（TがT | undefinedになる）ので、一旦諦めてなんで上記のような挙動になるのか推測しました。

# 差分の考察

`closed` や `ready` の戻り値が、Node.jsだと `Promise<undefined>`、TypeScriptだと `Promise<void>` となっています。これはプロパティのみ差分があることから、Node.jsではプロパティの場合は`void`を避けるようにしていると予想できます。

`ReadableStreamBYOBReader` の差分についてはTypeScriptの型の採用条件が関係するようです。

[lib.dom.d.tsがどのように更新されるか調べてみた](https://zenn.dev/keita_hino/articles/2f6c2a19978fa8)という記事はTypeScriptの型定義の更新に関する調査の記事です。これによると

> MDN の Browser compatibility を基準にしていて、2 つ以上のブラウザエンジンがサポートすれば、自動的に型が追加されるみたいです。

ということです。実際[ReadableStreamBYOBReader#read](https://developer.mozilla.org/ja/docs/Web/API/ReadableStreamBYOBReader/read)メソッドを見てみると、第2引数のoptions.minはFirefoxのみサポートされています。そのため、TypeScriptにはありませんでした。

また別のタイミングで時間を取って、頑張って型エラーを排除して型とより仲良くなろうと思います。
