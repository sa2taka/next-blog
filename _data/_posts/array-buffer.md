---
layout:      post
title:       TypeScript5.9以降、Buffer関連で型エラーが発生する
category:    typescript
author:      sa2taka
tags:        javascript,typescript,programming
public:      true
createdAt:   2025-09-18
updatedAt:   2025-09-18
latex:       false
description:
   TypeScript 5.9以降でBuffer関連の型エラーが発生する原因と解決策を解説。ES2024でArrayBufferとSharedArrayBufferが非互換になり、TypedArrayが型引数を持つようになった背景を探り、解決策を紹介します。
---

TypeScript5.9以降で、下記の処理が型エラーになります。

```typescript
import { readFileSync } from "fs";

const imgApi = () => {
  const img = readFileSync('/path/to/img.png');

  return new Response(img, { headers: { 'Content-Type': 'image/png' } });
  //                  ^ 型 'Buffer<ArrayBufferLike>' の引数を型 'BodyInit | null | undefined' のパラメーターに割り当てることはできません。
}  
```

本記事は、上記の型エラーの背景を探り、解決策を考えます。背景について自分の理解を深めるための調査している分長くなっているので、 サクッと解決したい場合は[解決策](#解決策)を見ていただければ。

# 型エラーの詳細

[TypeScript 5.9のリリースノート](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)において、上記について記載があります。

> ArrayBuffer has been changed in such a way that it is no longer a supertype of several different TypedArray types. This also includes subtypes of UInt8Array, such as Buffer from Node.js.
> > ArrayBuffer は変更され、もはや複数の異なる TypedArray 型のスーパータイプではなくなりました。これには、Node.js の Buffer など、UInt8Array のサブタイプも含まれます

`readFileSync` の型は `Buffer` です。しかしながらTypeScript5.9、正確には[5.7より](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html#typedarrays-are-now-generic-over-arraybufferlike)Bufferなどに型引数が付与されており、型引数が設定されていない場合は `Buffer<ArrayBufferLike>` が返ってきます。  `new Response` の期待している引数は `ArrayBufferView<ArrayBuffer>` です。 `ArrayBufferView` は `Buffer` のサブセットですが、型引数が `ArrayBufferLike` と `ArrayBuffer` で異なるため、型エラーとなっています。

# 背景

上記の型エラーの詳細を完全に理解するために、いくつか調査をしてみました。

## そもそもTypedArrayとはなに

5.7のアップデートでは下記のようなタイトルで型引数が設定されていることが記載されています。

> TypedArrays Are Now Generic Over

そもそも `TypedArrays` ってなんでしょうかね。


[MDNのドキュメント](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)を見てみると、TypedArrayは「バイナリデータバッファの配列のようなビュー」と説明されています。まぁ、簡単に言うと**メモリ上の生のバイナリデータを、JavaScriptで扱いやすくするための型付き配列**という感じですね。

JavaScriptの通常の配列（Array）は、どんな型でも格納できて便利ですが、その分メモリ効率は良くありません。一方でTypedArrayは、特定の型（8ビット符号なし整数とか、32ビット浮動小数点数とか）に特化した配列で、メモリ効率が良いという特徴があります。

本項に関してはこの辺の記事も参考になるはずです：https://zenn.dev/porokyu32/articles/79b81a46cbba2e

### TypedArrayの種類

ちなみに、「TypedArray」というのは抽象的な概念で、実際には以下のような具体的な型が存在します：

```javascript
// 符号なし整数
const uint8 = new Uint8Array([1, 2, 3]);        // 8ビット符号なし整数（0～255）
const uint16 = new Uint16Array([256, 512]);     // 16ビット符号なし整数
const uint32 = new Uint32Array([65536]);        // 32ビット符号なし整数

// 符号あり整数
const int8 = new Int8Array([-128, 127]);        // 8ビット符号あり整数（-128～127）
const int16 = new Int16Array([-32768, 32767]);  // 16ビット符号あり整数

// 浮動小数点数
const float32 = new Float32Array([3.14, 2.71]); // 32ビット浮動小数点数
const float64 = new Float64Array([Math.PI]);    // 64ビット浮動小数点数（いわゆるdouble）
```

まぁただ、僕が一般的に見るのは `Uint8Array` ですかね。というのもNode.jsの`Buffer`も実はUint8Arrayのサブクラスだからですね。今回の型引数の追加が`Buffer`に影響する理由もそこです。

### ArrayBufferとの関係

そんでもって、このTypedArrayは必ず**ArrayBuffer**の上に構築されます。イメージとしては、ArrayBufferが生のメモリ領域で、TypedArrayがそれを特定の型として解釈するビューという感じでしょうか。

```javascript
// ArrayBufferを作成（16バイトのメモリ領域）
const buffer = new ArrayBuffer(16);

// 同じバッファを異なる型として解釈
const view1 = new Uint8Array(buffer);   // 16個の8ビット要素として見る
const view2 = new Uint32Array(buffer);  // 4個の32ビット要素として見る

console.log(view1.length);  // 16
console.log(view2.length);  // 4
```

このような仕組みになっているため、ArrayBufferの型が変わると、それを参照するTypedArrayの型も影響を受けるんですね。これが今回の型引数追加の背景にあります。

## なぜTypedArrayに型引数が付与されたのか

TypeScript 5.7でTypedArrayに型引数が付与された背景には、**ECMAScript 2024（ES2024）でArrayBufferとSharedArrayBufferの仕様が大きく変わった**ことがあります。

### ES2024での変更点

[型引数が付与されたPR](https://github.com/microsoft/TypeScript/pull/59417)がその辺は詳しいです。

> Starting with ES2024, both ArrayBuffer and SharedArrayBuffer diverge significantly due to ArrayBuffer now being resizable, and SharedArrayBuffer being growable:
> > ES2024以降、ArrayBufferはリサイズが可能に、SharedArrayBufferは拡張が可能になったため、ArrayBufferとSharedArrayBufferは大きく異なるものになった。

具体的には、ES2024でArrayBufferにリサイズ機能（`resize()`メソッドや`transfer()`メソッド）が追加され、SharedArrayBufferには拡張機能（`grow()`メソッド）が追加されました。その結果、両者は互いに代入できない別々の型になりました。

### TypeScript 5.7の解決方法

この問題を解決するために、TypeScript 5.7では**TypedArrayに型引数を付与**しました。これによって、TypedArrayを作成する際にどのArrayBufferを使ったかを型レベルで追跡できるようになりました。一方で、デフォルトでは`ArrayBufferLike`型が利用されるため、`ArrayBuffer` や `SharedArrayBuffer` を想定している処理で動作しなくなりました。

ちなみに余談も余談ですが、DefinitelyTypedでは一括で対応されたらしいです。

- https://github.com/DefinitelyTyped/DefinitelyTyped/pull/70390
- https://github.com/DefinitelyTyped/DefinitelyTyped/pull/70694

## ArrayBufferとSharedArrayBufferってなに

そもそも論ArrayBufferとSharedArrayBufferって何なんでしょうかね。本記事とは直接関係ないのですが調べてみました。

### ArrayBuffer：排他的アクセス

[MDNのドキュメント](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)によると、ArrayBufferは「汎用的な生のバイナリデータバッファ」です。特徴的なのは、**一度に一つの実行コンテキストからしかアクセスできない**ことです。

```javascript
// ArrayBufferの作成
const buffer = new ArrayBuffer(16);

// 他のコンテキスト（Workerなど）に送信する際は「transfer」される
// つまり、元のコンテキストでは使えなくなる
worker.postMessage(buffer, [buffer]);
console.log(buffer.byteLength); // 0 - detached状態になる
```

この「transfer」の仕組みによって、**メモリの所有権が移転される**ため、データ競合やメモリリークを防げるんですね。その分、マルチスレッドでデータを共有するのは簡単ではありません。

ES2024ではArrayBufferに新しい機能が追加されました：

- **リサイズ機能**: `resize(newByteLength)`でサイズを変更可能
- **転送機能**: `transfer(newByteLength)`で効率的な所有権移転

```javascript
// リサイズ可能なArrayBuffer（ES2024）
const resizableBuffer = new ArrayBuffer(16, { maxByteLength: 64 });
console.log(resizableBuffer.resizable); // true
resizableBuffer.resize(32); // サイズを倍に
```

### SharedArrayBuffer：共有アクセス

一方で[SharedArrayBuffer](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)は、名前の通り**複数の実行コンテキストから同時にアクセスできる**バッファです。これによって、真の並列処理が可能になります[^atomis]。


[^atomis]: 同時アクセスできるってことは、**データ競合や競合状態のリスク**があるということでもあります。そのため、SharedArrayBufferを安全に使うためには[Atomics API](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Atomics)と組み合わせることが推奨されています。

```javascript
// SharedArrayBufferの作成
const sharedBuffer = new SharedArrayBuffer(16);

// 複数のWorkerから同時にアクセス可能
worker1.postMessage(sharedBuffer);
worker2.postMessage(sharedBuffer);
// この後、メインスレッドでも使える（transferされない）
console.log(sharedBuffer.byteLength); // 16
```

ES2024ではSharedArrayBufferにも新機能が追加されましたが、拡張のみ可能で縮小はできません：

```javascript
// 成長可能なSharedArrayBuffer（ES2024）
const growableShared = new SharedArrayBuffer(16, { maxByteLength: 64 });
console.log(growableShared.growable); // true
growableShared.grow(32); // 成長は可能
// growableShared.shrink(16); // 縮小メソッドは存在しない
```

こちらもまた余談の余談ですが、SharedArrayBufferを使うには、Webブラウザで特定のセキュリティヘッダーが必要です：

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

これは[Spectre攻撃](https://ja.wikipedia.org/wiki/Spectre_(%E8%84%86%E5%BC%B1%E6%80%A7))などのサイドチャネル攻撃を防ぐための対策で、高精度タイマーと共有メモリの組み合わせが悪用されるのを防いでいるんですね[^security-requirement]。

[^security-requirement]: このセキュリティ要件については、MDNの[SharedArrayBufferのセキュリティ要件](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements)で詳しく説明されています。

# 解決策

下記に関しては、問題は `readFileSync` の型が `Buffer<ArrayBufferLike>` だったのが問題でした。

```typescript
import { readFileSync } from "fs";

const imgApi = () => {
  const img = readFileSync('/path/to/img.png');

  return new Response(img, { headers: { 'Content-Type': 'image/png' } });
  //                  ^ 型 'Buffer<ArrayBufferLike>' の引数を型 'BodyInit | null | undefined' のパラメーターに割り当てることはできません。
}  
```

`@types/node` パッケージでは22.16（正確には22.15のどこか）などを始め、最新バージョンでは `readFileSync` などの型が新しくなっています。 `NonSharedBuffer` 型と `AllowSharedBuffer` が追加され、それぞれ下記のような定義されています。

https://github.com/DefinitelyTyped/DefinitelyTyped/blob/07e47671e94ae694efe0caabbe1d9627c13a7346/types/node/buffer.buffer.d.ts#L454-L455

ref: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72687

これらを利用して `fs` などの型が改善されています。そのためnodeの型を最新版に更新すれば治る場合もあると思うので、 `@types/node` を更新してみましょう。

ただ、ライブラリなどによってはまだ型が対応されていないケースもあるでしょうから、とりあえずは型アサーション等で対応すればよいと思います。

```typescript
import { readFileSync } from "fs";

const imgApi = () => {
  const img = readFileSync('/path/to/img.png');

  // 型アサーションで解決
  return new Response(img as Uint8Array<ArrayBuffer>, {
    headers: { 'Content-Type': 'image/png' }
  });
}
```

最悪 `Buffer` や `UInt8Array` に詰め直す方法も良いでしょう。ただ**コピーのコストがかかるので**、型が更新されるのを待つ（か、自分で修正して貢献する）かするまではTypeScript5.8を使う判断でもいいと思います。


```typescript
import { readFileSync } from "fs";

const imgApi = () => {
  const img = readFileSync('/path/to/img.png');

  const newArrayBuffer = new ArrayBuffer(img.buffer.byteLength);
  const newUint8Array = new Uint8Array(newArrayBuffer);
  newUint8Array.set(img);

  // sliceはなぜか知らないがBuffer<ArrayBuffer>が返ってくるのでそれを使っても似たような感じになる
  // sliceは非推奨メソッドっぽいけど
  // const newUint8Array = img.slice()

  return new Response(newUint8Array, {
    headers: { 'Content-Type': 'image/png' }
  });
}
```

# 参考記事

上記で直接参照されていない参照記事は下記です。

- https://zenn.dev/pixiv/articles/b241ee3d046740
- https://qiita.com/yokra9/items/c280f0499d28b18d5c5a
- https://qiita.com/toshi00ysm/items/ec118ee9457e5e141ef8
