---
layout:      post
title:       linariaからNext.jsのCSS Modulesに切り替えた
category:    css
author:      sa2taka
tags:        next.js,linaria
public:      true
createdAt:   2024-09-08
updatedAt:   2024-09-08
latex:       false
description:
   LinariaからCSS Modulesに切り替えた備忘録と理由を書きます。
---

本ブログのスタイルは[linaria](https://github.com/callstack/linaria)を利用していましたが、Next.jsの[CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css#css-modules)に切り替えました。その時の備忘録です。

# 理由

このブログを作成した頃はCSS-in-JSが潮流、特にZero Runtimeが流行っていたためlinariaを使ってみたく採用してみました。vanilla-extractもそうですが、設定が少し面倒なだけでかなり書き心地は良いと思ってます。

linaria、正確には[WyW-in-JS](https://wyw-in-js.dev/)はTransformerとして**babelに依存**しています[^does-wyw-in-js-depend-on-babel]。
一方でこのブログはNext.jsのSSGを利用したものとなっています。Next.jsは[v12より**SWCによるコンパイルが有効**になっています](https://nextjs.org/docs/architecture/nextjs-compiler)。linariaを利用するためにはbabelが必要となり、SWCの利用ができないです。
WyW-in-JSに切り替わったlinaria v6へのアップデートするタイミングでそのあたりのコンセプトの理解も正直ドキュメントが充実しておらず難しく、切り替えを決断しました（決断したのは半年ぐらい前でしたが、面倒だったので放置してました）。

[^does-wyw-in-js-depend-on-babel]: WyW-in-JSのREADMEやサイトを読んでも、いまいちbabelに依存している感はないですが、コードを呼んでみるとbabelを前提としているように見えます。私の解像度の10倍ぐらいでコードリーディングしている方がいたので、気になる方は[WyW-in-JS のコードリーディング](https://zenn.dev/kotarella1110/scraps/26fdd1ecd55da5)を参照してください

# CSS Modulesに切り替えた手順

愚直にやるだけです。が、自分が理解していないだけではあったんですが、ハマりどころがありました。

linariaでは下記のようなコードがありました。ブログはrootあたりに`theme-light`や`theme-dark`クラスを付与してテーマを切り替えていました。そのためこのスタイルが指定されているコンポーネントはテーマによってスタイルが変わるようになっています。

```typescript
const style = css`
   .theme-light & {
      color: var(--color-title-light);
   }

   .theme-dark & {
      color: var(--color-title-dark);
   }
`;
```

これをCSS Modulesに切り替えるためには、**少し工夫が必要です**。というか、CSS Modulesの基本を知っていたらすぐに分かるのですが、いかんせん雰囲気でやっていたので、1回対応したときは全くうまくいかずに断念してました。

CSS Modulesには**グローバルスコープ**と**[ローカルスコープ](https://github.com/css-modules/css-modules/blob/master/docs/local-scope.md)**があります。ローカルスコープはファイルごとにスコープが生成されるため、他のファイルのスタイルを参照できません。そのためにCSS Modulesではクラス名にハッシュを付与することでスコープを生成しています。逆に言うと、ルートにある `theme-light` クラスを指定したとしても、ローカルスコープで`.theme-light`を指定してしまうと、**別のクラス名に変換されてしまうためスタイルが適用されません**。

```css
-- 実際生成されるのは .theme-light__12345 .title__67890 的な感じ
.theme-light .title {
   color: var(--color-title-light);
}
```

これを回避するためには、`theme-light` を**グローバルスコープとして宣言すること**です。[Exceptions](https://github.com/css-modules/css-modules/blob/master/docs/composition.md#exceptions)にて記載されていますが、 `:global`という疑似属性みたいなものを使うことで、**グローバルスコープとして宣言できます**。

```css
:global(.theme-light) .title {
   color: var(--color-title-light);
}
```

ちなみに、Claudeにファイルを投げて「CSS Modulesに変換して」とやると簡単に変換できるので良かったです。
 