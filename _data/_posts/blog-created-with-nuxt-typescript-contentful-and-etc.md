---
layout:      post
title:       ブログって自分で作るもの? : Nuxt.js × Typescript × Contentful × エトセトラで1から作るブログ
author:      sa2taka
category:    typescript
tags:        nuxt,nuxtjs,typescript,contentful,vue,vuetify
public:      true
createdAt:   2020-04-25
updatedAt:   2022-07-10
latex:       undefined
description:
  ブログを作る、それはどこから? 私はNuxtとContentfulを使って今回は1からブログを作りました。今回の記事ではブログの構成の紹介をします  
---

ハローワールド。
はじめまして。晴れてブログを作成することが出来ました、とっぷらです。

突然ですが、これがトップページのLighthouseの結果だ!
![全て100点のLighthouseの結果](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/%E5%85%A8%E3%81%A6100%E7%82%B9%E3%81%AELighthouse%E3%81%AE%E7%B5%90%E6%9E%9C.png)

本ブログのトップページ画面にて、見事花火を上げることが出来ました!

今回はこのブログについて、構成とLighthouseのパフォーマンスの紹介できればと思います。
1からブログを作ってみたい、というかなり狭いターゲットにおすすめの記事です。

[本ブログのソースコード(github)](https://github.com/sa2taka/blog)です。試行錯誤の跡を是非御覧ください。

# 作者スペック

このブログを作ったのは一体誰なんだ、自己紹介がてらスペックを記載します。
大した人間が作ってるわけじゃない、というのが分かれば幸いです。

- 名前: とっぷら/sa2taka
- よく書く/書ける言語: Ruby、TypeScript、Powershell(Windowsバッチはまかせろ)
- プログラミング歴: 高専出身ですが、まともに書き出したのは今(2020)から3年ほど前。
- Vue歴: 2年
- Nuxt歴: 今回が初めて。なんですか、JavaScriptでSSRって
- 本業: インフラ。インフラが苦手な、インフラ
- 趣味: 認証認可。最近サボリ気味

# ブログ構成

今回作成したブログは、表題にもある通りNuxt.js×TypeScriptを軸として作成し、ブログの管理部分はHeadless CMSのContentfulを利用しています。

一応画像に起こしてみましたが、あまり大した構成ではないですね。

![ブログのアーキテクチャ](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/blog%20architecture.png)

## Nuxt.js

[Nuxt.js](https://ja.nuxtjs.org)は、Vue.jsのフレームワークの一つです。Vueの機能を使いつつ、より便利な機能やルールを追加したフレームワークです。具体的に言うと、Vue-routerやVue-loader、Vuexなどの主要ライブラリがデフォルトでくっついてきたり、SPAだけではなく、SSRや静的ページの生成などもサポートしています。

今回Nuxt.jsを選定した理由ですが2点あります。
- どちらかというとReactよりVueが好き
- ブログと言えばSSRだろ(という根拠のない認識)

Vue×SSRといえばNuxt、ということなので今回はNuxtで作成しました。あまりこだわった選定ではないことがわかりますね。

僕はVue公式ツールである[Vue-Cli](https://github.com/vuejs/vue-cli)[^vue-cli]が非常にお気に入りということもあり、Nuxtには触れてきたことがありませんでした。そのため、SSR特有の癖や、NuxtとVue-Cliの絶妙な違いに悩まされることが非常に多かったです。

[^vue-cli]: Vueの公式の環境構築ツール。TypeScript対応やVuex、Vue-router、Lintの設定やTesingツールの構成まで自動的にやってくれるすぐれものです。またプラグインの追加や設定なんかもVue-Cli上で出来てしまうという優れもの。
### NuxtとTypescriptの相性

今回のブログを作成する上で、言語はTypeScriptを選定しました。
理由はVueをTypeScriptでやる快感と、VSCodeの恩恵をフルに感じたかったからです。それだけです。

[^vue-cli-typescript]: Vue-Cliではcreateコマンドのオプションを設定することで、面倒な設定を何も行わずにTypeScriptでVueの大航海を行うことが可能です。

Nuxtとの相性ですが、結論から言うと、Vue-Cliほどの親和性はありませんでした[^vue-cli-typescript]。

一応[Nuxt TypeScript](https://typescript.nuxtjs.org/ja/)というサイトがあるので、こちらを元に環境構築は可能です。ただ`create-nuxt-app`コマンドでnuxtのアプリケーションを作成する際に、色々と自動的に対応してくれ、と思ってしまいます。そう思うのも、やはりVue-Cliをダイレクトマーケティングのごとく、事あるごとに出したくなるほど優秀だからだと思います。

Nuxt×TypeScriptの記事は色々ありますが、バージョンの違いなのか何なのか、色々ありましたので、私も後日Nuxt×TypeScriptの環境構築の方法でも記載しようかと思います。

## Vuetify

[Vuetify](https://vuetifyjs.com/ja/)はVue用のUIコンポーネントです。
私がVueでWebアプリを作るとなると必ず使っているお気に入りです。

シンプルかつ使いやすいマテリアルコンポーネント、分かりやすいドキュメントが個人的にとても好きです。

[Nuxt用のVuetify](https://github.com/nuxt-community/vuetify-module)もあるので、Nuxtだからと言って困ることはありませんでした。

## markedown-it
今回のブログでは、ブログの管理部分に後術するContentfulを利用しています。Contentfulではブログ本文をマークダウンで記載しているため[^contentful-markdown]、ブログではマークダウンをHTMLに変換する必要があります。

今回最終的に利用したマークダウンパーサーは[markdown-it](https://github.com/markdown-it/markdown-it)です。JavaScript製のマークダウンパーサーで、プラグインという概念を用いてマークダウンパーサーとしての機能を拡張することが可能です。
独自でプラグインを作ることも簡単で、私も簡単にですが自作のプラグインで拡張しています。

[^contentful-markdown]: Contentfulのマークダウンエディタにプレビュー機能がないため、マークダウン自体は[HackMD](https://hackmd.io/)を使っていたりします

### markdown-it vs marked

実は、最初に導入したマークダウンパーサーは[marked](https://github.com/markedjs/marked)でした。Star数でもmarkdown-itの3倍あり人気のライブラリのひとつです。
今回markedからmarkdown-itへ移行した理由は「注釈機能がない」というただ1点[^marked-does-not-have-footnote]です。

まぁ、必要かと言われると怪しい部分はありますが、割と注釈に書くことが多いため、注釈のある・なしは私の中では重要だったりもします。

markdown-itでは[markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)を利用することで簡単に対応することが出来ます。
markedも機能を拡張することも出来ますが、markdown-itと拡張のやり方が根本的に異なるので、(挑戦こそしませんが)注釈機能の追加は難しいのではないかな、と思います。

[^marked-does-not-have-footnote]: 脚注自体はマークダウンの正式な機能ではないため、というのが公式の見解([Issue](https://github.com/markedjs/marked/issues/714))

### highlight.js

基本的にmarkdown-itで事足りますが、私はプログラムを書くので、ブログ上でもプログラムを載せることが多々あります。マークダウンではバッククォート3つで囲むことでコードブロックを表現できます。
ですが、これだけではプログラムが読みづらいだけです。

そこで、[highlight.js](https://highlightjs.org/)を使います。コードブロックの中にシンタックスハイライトが適用され、より読みやすいコードを表現することが出来ます。 

例えば

```ruby:example.rb
import 'foo.rb'

class Main
  def hoge
    fuga
  end
end
```

という風に。

highlight.jsは非常に高機能、多言語対応なため、特に設定しないとcssやjsのバンドルサイズがひどいことになります。

[パフォーマンス](#パフォーマンス)に詳しく方法は記載しますが、highlight.jsのバンドルサイズを軽量化するだけで、lighthouseでのパフォーマンスの点数が10点上がる程にはパフォーマンスが向上します。

#### highlight.jsとpurgeCSS

余談ですが、highlight.jsを利用する際にスタイルが効かないことがありました。

結論としては今回、cssのバンドルサイズを減らすために[purgeCSS](https://purgecss.com/)を利用していますが、これを利用するとhighlight.jsのスタイルが一切効かなくなってしまいます。

purgeCSSは利用していないcssのクラスなどを削除してくれますが、highlight.jsは動的に生成されるものなのでビルド段階でhighlight.jsのクラスは一切使用していません。そのため以下の設定を入れて`nuxt.config.ts`に入れてあげることでhljsから始まるクラスは削除されることがなくなります。

```typescript:nuxt.config.ts
export default {
  # 中略
  purgeCSS: {
    #...
    whitelistPatternsChildren: [/^hljs/],
    #...
  },
  # 中略
};

```

## Contentful

[Contentful](https://www.contentful.com/)はHeadless CMSの一つです。CMS、というとWordpressなどを想像しますが、Headless CMSはAPIファースト(というかAPIオンリー)のCMSと呼べると思います。
WordpressなどのCMSでは(私は触ったこと無いので詳しくは知りませんが)、例えばブログであれば、ブログの管理ページとブログの表示ページがあります。しかし、Contentfulでは管理ページしかなく、コンテンツはAPIを通して取得することが可能です。

今回はブログ、画像の管理とストレージみたいな利用方法です。無料で5000アイテムまで作れるので、まぁ、私がそれを使い切ることはまぁそうそうないでしょう。

## Hosting(Google App Engine)

このサイトは現在[GAE(Google App Engine)](https://cloud.google.com/appengine?hl=ja)上で動作しています。

普段、私はSPAばかり書いているため、FirebaseのHosting機能を主に使ってアプリケーションを公開していました。しかし、このブログはSSR。ということで、何かしらのPaaSへホスティングすることを検討する必要がありました。
今回は特に理由もないですがGAEを採用しました。Herokuでも良かったですが、Herokuはもうすでに使っちゃってるので...。

Nuxtでは公式が様々なサービス上にデプロイする方法を記載しています。GAEへのデプロイ方法についても記載があり([Google App Engine へデプロイするには？](https://ja.nuxtjs.org/faq/appengine-deployment))特に難しいことなく行うことが出来ました。

GAEは未だにNode v12で実行できないのが痛いですが、デプロイがめちゃくちゃ簡単でとても良かったです。
今回はGithub Actionsを利用してmasterブランチへpushされたら自動的にGAEへデプロイするような仕組みまで作り上げたので、そのあたりもいつか記事にできればと思います。

# Lighthouseのパフォーマンスの対応

![Lighthouseのパフォーマンスの結果](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Lighthouse%E3%81%AE%E3%83%8F%E3%82%9A%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%B3%E3%82%B9%E3%81%AE%E7%B5%90%E6%9E%9C.png)

Lighthouseのパフォーマンスですが、実はあまり大したことはやってません。おそらくNuxtがデフォルトでよしなにやってくれるのとGAEがそれなりに早いこと、そしてあまり複雑な処理がまだないためだと考えられます。

ちなみに完成直後はこんな感じ。何もしてなくても、結構点数が高いですね。

![改善前のLighthouseの結果](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/%E6%94%B9%E5%96%84%E5%89%8D%E3%81%AELighthouse%E3%81%AE%E7%B5%90%E6%9E%9C.png)

## ファイル・バンドルサイズの削減

パフォーマンスを著しく下げていたのは大きいCSSやJSでした。
サイズを小さくするためにやったことは下記の2つです。

- highlight.jsのバンドルサイズの削減
- purgeCSSの導入

### highlight.jsのバンドルサイズの削減

[highlight.jsの項](#hightlight.js)でも少し言いましたが、highlight.jsは特に何もしないとバンドルサイズがすごいことになります。パフォーマンスに直に響いてくるレベルで、すごいことになります。

#### highlight.jsがでかすぎる

まずは何もしない場合、`yarn build --analyze`を行った結果です[^nuxt-analyze]。

![highlight.jsが占める割合が大きい](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/highlight.js%E3%81%8B%E3%82%99%E5%8D%A0%E3%82%81%E3%82%8B%E5%89%B2%E5%90%88%E3%81%8B%E3%82%99%E5%A4%A7%E3%81%8D%E3%81%84.png)

少し小さくて見づらいですが、なんとhighlight.jsだけで1.04MBあります。でかすぎる。Gzipで圧縮しても245kB。
流石にこれは考えたほうがいいですね。今後mathematicaやisbl、gmlを使ったブログを書く気はおそらくありませんもの。

こうなってしまう原因はこれです。

```javascript
import hljs from 'highlight.js'
```

こうすると、highlight.js君の中身をすべてまとめてしまいます。結果として上記画像のようにクソデカライブラリが出来てしまいます。

#### highlight.jsのバンドルサイズを減らす方法

全部を一気にimportするのが問題なので、必要な機能のみimportできればバンドルサイズと無駄が減ります。

[こちらの記事](https://blog.mitsuruog.info/2017/12/how-bundle-size-makes-smaller)を参考に減らします。

```typescript
// @ts-ignore
import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/atom-one-dark.css';

// @ts-ignore
import javascript from 'highlight.js/lib/languages/javascript';
// @ts-ignore
import typescript from 'highlight.js/lib/languages/typescript';
// @ts-ignore
import ruby from 'highlight.js/lib/languages/ruby';
// @ts-ignore
import xml from 'highlight.js/lib/languages/xml';
// @ts-ignore
import css from 'highlight.js/lib/languages/css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);

export default hljs;
```

もう少し頭良く出来そうなものですが、とりあえず愚直に全部書いてます。

ちなみに大量の@ts-ignoreがついているのは、なぜか@types/highlight.jsを追加してもここら辺の型定義がされていないのかエラーになるからです。実は別のやり方があるのでしょうか。

後はこのファイルをhighlight.jsを使いたい場所でimportするだけ。

```typescript
import hljs from './hljs';
```

#### 結果

![改善した結果highlight.jsを97%削減](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/%E6%94%B9%E5%96%84%E3%81%97%E3%81%9F%E7%B5%90%E6%9E%9Chighlight.js%E3%81%AE%E3%82%B5%E3%82%A4%E3%82%B9%E3%82%99%E3%82%92%E5%A4%A7%E5%B9%85%E5%89%8A%E6%B8%9B.png)

58.65kB、gzipで圧縮すると7.98kBまで圧縮されました! 
元のファイルから97%程削減した、と考えると凄まじい効果ですね。

[^nuxt-analyze]: [nuxtのビルドオプションの一つ](https://ja.nuxtjs.org/api/configuration-build/#analyze)。[webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)を使ってwebpackのバンドルサイズを視覚的に表示してくれる

### purgeCSSの導入

[purgeCSS](https://purgecss.com/)は使っていないCSSを削除してCSSのサイズを減らしてくれるライブラリです

具体的には実際のコンテンツとCSSスタイルシートを見比べ、使っていないCSSを削除してくれます。

余談ですが、Vuetifyのサイズを小さくすることにあまり注力していないためpurgeCSSを入れたらどうなるかな、と思って入れてみた次第です。本気でやるなら、vuetifyをどうにかする必要があります。

#### 「使っていないCSS」の罠
「使っていないCSS」ですが、これはビルド時に使っていなければ使っていない扱いとなってしまいます。

どういうことかというと、動的に生成されるコンテンツで使われているcssは「使われない」扱いとなってしまいます。

今回非常に困ったのはvuetify、そしてhighlight.jsです。[highlight.jsとpurgeCSS](#highlight.jsとpurgeCSS)にて記載しましたが、これら2つで利用しているクラスが削除されてしまい動かなくなってしまいました。
VuetifyのCSSサイズを減らすつもりで導入したのに、VuetifyのCSSが消し飛ぶ本末転倒の事態に。

なので、今回は下記のような設定にしました。
具体的には`whitelistPatternsChildren`の項目が重要です。`v-`から始まるクラス(Vuetifyのクラス)と`hljs`から始まるクラス(highlight.jsのクラス)を消さないような設定としています。

```typescript:nuxt.ts
export default {
  purgeCSS: {
    enabled: true,
    paths: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'node_modules/vuetify/dist/vuetify.js',
    ],
    styleExtensions: ['.css'],
    whitelist: ['body', 'html', 'nuxt-progress'],
    whitelistPatternsChildren: [/^v-/, /^hljs/],
    extractors: [
      {
        extractor: (content: any) => content.match(/[A-z0-9-:\\/]+/g) || [],
        extensions: ['html', 'vue', 'js'],
      },
    ],
  },
}
```

#### 結果

`yarn build`でビルドしたときにどれぐらいの容量になるかを確認します。以下に示すのはcssのみで、少し表示データを少なくしています。

まずpurgeCSS有効化前。

```
20b61c033c20ab53c1a4.css   1.39 KiB  app
776edbafed198da24170.css   8.15 KiB  vendors.pages/post/_slug
7e92d5677ef9fed5a0f0.css   19.9 KiB  vendors.pages/category/_slug.pages/index
8f62fe26c028357707f6.css    321 KiB  vendors.app
9844b0e6dc3d45cad1e2.css  142 bytes  pages/category/index
d6a50da56bc00ac6de30.css  374 bytes  pages/index
f4eeb70f6ebba6ca810c.css   3.41 KiB  pages/post/_slug
fdef3d62246149f316be.css  361 bytes  pages/category/_slug
```

そしてpurgeCSS有効化後

```
20b61c033c20ab53c1a4.css   1.29 KiB  app
776edbafed198da24170.css   8.15 KiB  vendors.pages/post/_slug
7e92d5677ef9fed5a0f0.css   19.8 KiB  vendors.pages/category/_slug.pages/index
8f62fe26c028357707f6.css    244 KiB  vendors.app
9844b0e6dc3d45cad1e2.css  142 bytes  pages/category/index
d6a50da56bc00ac6de30.css  374 bytes  pages/index
f4eeb70f6ebba6ca810c.css   3.41 KiB  pages/post/_slug
fdef3d62246149f316be.css  361 bytes  pages/category/_slug
```

...あれ、あんまり変わってなくない? と思いますが、上から4行目のvendors.appの部分が70KiBも削減されています。大体24%の削減ですね。

残念ながら`v-`から始まるクラスを全部削除できないのでvuetifyにも無駄なクラスが残っていますが、多少は減りましたので問題ないでしょう(適当)。
# 参考

パフォーマンスに関して非常に参考になったサイトがこちらです。
この場を借りてお礼申し上げます。

> 阿部寛を超えるための技術: はてなブログからNuxtに移行した話
> https://blog.andoshin11.me/posts/pwa-blog-with-nuxt
> 

構成も本サイトとほとんど同じであるため、色々な部分にコピーの跡が見られます。
そのため開発段階でパフォーマンスに関するある程度の施行がされていたため、チューニング前からある程度早かったのだと思われます。
