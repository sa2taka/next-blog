---
layout:      post
title:       workboxの「Stale-While-Revalidate」キャッシュ戦略時、裏でデータを取得したときの通知を受け取りたい
category:    typescript
author:      sa2taka
tags:        Nuxt,Workbox
public:      true
createdAt:   2020-05-24
updatedAt:   2020-05-24
latex:       undefined
description:
  PWAのオフライン対応をより簡単に行えるWorkbox。Workboxのキャッシュ戦略の中の「Stale-While-Revalidate」パターンにおいて、裏でデータを取得したときに通知を受け取り、それを元に画面の再描画を行うまでの方法を記載しました。  
---

ハローワールド

表題の内容だけを知りたい方は[Stale-While-Revalidateのデータ更新イベントを取得](#Stale-While-Revalidateのデータ更新イベントを取得)章を御覧ください。

PWA[^pwa]、という単語も今では珍しい単語ではないと思われます。PWA、とまで行かずともService Workerを使ってキャッシュを取得し、コンテンツの読み込み速度を高める場合も多いかと思います。

[^pwa]: Progressive Web Appの略。Webサイトをネイティブアプリのように扱える技術、とまとめられることが多い。Googleが主体となって動いてることもあり、Androidでの恩恵は高い。

[本サイトはNuxtで出来ていますが](https://blog.sa2taka.com/post/blog-created-with-nuxt-typescript-contentful-and-etc/#Nuxt.js)、Nuxtには[@nuxt/pwa](https://pwa.nuxtjs.org/)というライブラリがあり、数行の設定だけで簡単にPWAを利用することが出来ます。

そんな@nuxt/pwaですが、内部のモジュールに[Workbox](https://developer.chrome.com/docs/workbox/)を利用しています。
WorkboxはGoogle謹製のライブラリです。

> JavaScript Libraries for adding offline support to web apps

と説明しているように、PWAの要素の内、特にオフラインサポートに力を入れるライブラリです。
本ブログでもWorkboxの設定で様々なキャッシュを行っています。具体的に説明していきます。

# Workbox

オフラインサポート、つまりオフラインでもWebアプリを利用するためにはどうすれば良いのか。これは（言うのは）非常に簡単で、必要なデータをキャッシュすれば良いのです。

これを可能にしているのがService Worker。[MDNのService Workerの説明](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)がありますので、詳細はMDNに任せるとします。

Service WorkerはMDNで下記のように記載されています。

> JavaScript ファイルの形を取り、ナビゲーションやリソースへのリクエストを横取りや改変したり細かい粒度でリソースをキャッシュすることで関連付けられたウェブページやサイトを制御し、それぞれの状況（もっとも顕著な例は、ネットワークが利用できないとき）にアプリがどのように振舞うかを完全に制御することができます

個人的に好きな言い回しは「Service Workerは合法MITM[^mitm] のような技術」です（[「2020 年、 React 軸で学ぶべき技術」のブログ記事より引用](https://mizchi.hatenablog.com/entry/2020/01/04/172041))

[^mitm]: Man In The Middle attack.日本語では中間者攻撃と呼ばれる。盗聴の方法の1つである。通信の途中に攻撃者が入り込み、お互いの通信を盗み取る方式である。MITMの説明だけで500wordsぐらいのブログ記事はかけそうなので説明は行わないが、Service Worker以外の合法MITMとしてSSLインスペクションを挙げておく。

しかしながら、Service Workerは設定がそれなりに面倒くさいです（残念ながらやったこと無いので、周りの意見です）。
その面倒くさい設定を**肩代わりしてくれる**のが**Workbox**です。

```javascript
workbox.routing.registerRoute(
  new RegExp('^https://blog.sa2taka.com/$'),
  new workbox.strategies.StaleWhileRevalidate({}),
  'GET'
);
```

こう書いてあげるだけで、本ブログのトップページをキャッシュして、オフラインサポートをしてくれます。便利。

## Workboxのキャッシュ戦略

Workboxには[キャッシュ戦略](https://developer.chrome.com/docs/workbox/)と呼ばれるものがあります。全部で5つ（実質4つ）あります。キャッシュ戦略の説明は様々な記事で行われてるのでここではあえて触れることはしませんが、`Stale-While-Revalidate`戦略だけ説明します。本稿のタイトルにも登場していますから。

# Stale-While-Revalidate戦略

[公式の説明によると](https://developer.chrome.com/docs/workbox/#stale-while-revalidate)、

> The stale-while-revalidate pattern allows you to respond to the request as quickly as possible with a cached response if available, falling back to the network request if it’s not cached. The network request is then used to update the cache.
> > stale-while-revalidateパターンでは、キャッシュされている場合はキャッシュされたレスポンスで、キャッシュされていない場合はネットワークリクエストを行い、可能な限り迅速にリクエストに応答することができます。その後、ネットワークリクエストのレスポンスによってキャッシュを更新します。

簡単に言えば、キャッシュがあればキャッシュを使うし、なかったらネットワークからデータを取ります。Cache First戦略との違いは、キャッシュがあってもネットワークからデータを取得してきて、キャッシュと異なる場合は**キャッシュを更新します**。

Workboxの主とも言える戦略であり、キャッシュによる高速化と裏でのフェッチによるデータの最新化の両方が効率的に行なえます。

## 本ブログのStale-While-Revalidate戦略

Stale-While-Revalidates戦略は本ブログでも利用しています。特に本ブログでは**Contentfulから取得するデータ**においてStale-While-Revalidate戦略を利用しています。Contentfulから取得するデータ、特に記事一覧なんかは（私のやる気次第ですが）本ブログの中で最も更新が激しい箇所と言えます。

画像のほどに大きなデータではないとは思いますが、Network FirstではなくStale-While-Revalidates戦略を利用しています。

そんなStale-While-Revalidates戦略ですが、弱点としては裏側でネットワークからデータを引っ張ってきてるとはいえ、Cache First戦略と同じで見えるデータはキャッシュにあるものです。もちろんキャッシュは更新されるので、もう1回リロードすれば最新データになるんですが（おそらく）、せっかく裏側でキャッシュをとってきているなら、データが更新されたら、それを利用して再描画したいじゃないですか。

そうすれば、Cache Fristのような描画の高速化と、Network Firstのようなデータの最新化を**真に**行っていると言えるでしょう。

# Stale-While-Revalidateのデータ更新イベントを取得

こういった要望は比較的多いと考え、ネットワークの海に山程ドキュメントがあるだろうと思いましたが、実態はそうでもなかったです。多分そんな事するんだったらNetwork Firstにするわ、って人が多かったんでしょうか（適当）。

結論からいうと、今回行う作業は

- WorkboxのBroad Cast Update Pluginを有効にする
- その際にチャンネル名を設定する
- チャンネル自体にイベントリスナーを設定する

となります。

## WorkboxのBroad Cast Update Pluginを有効にする

WorkboxもデフォルトではStale-While-Revalidateのデータ更新イベントを吐いているわけで（おそらく）無いようなので、プラグインを利用して吐かせます。

NuxtのPWA、特にWorkboxは下記のような設定を行えます。

```typeccript:nuxt.config.ts
workbox: {
  runtimeCaching: [
    {
      urlPattern: '^https://blog.sa2taka.com/$',
      handler: 'staleWhileRevalidate',
      method: 'GET',
    },
  ]
}
```

しかしながら、プラグインの追加方法が一切わからなかったので今回は別の記載方法を利用します。

まず下記のように、runtimeCachingの部分を消して、chacingExtensionに置き換え、ファイル名を指定します。なぜかruntimeCachingとの同棲が出来ないみたいです。

```typescript:nuxt.config.ts
workbox: {
  cachingExtensions: '@/plugins/main-sw.js',
}
```

後は指定したファイルにworkboxの設定を入れ込みます。

```javasript:plugins/main-sw.js
workbox.routing.registerRoute(
  new RegExp('^https://blog.sa2taka.com/$'),
  new workbox.strategies.StaleWhileRevalidate({}),
  'GET'
);
```
このときlintがエラーを起こすので、`.eslintrc.js`とかでignoreすることを推奨します。

後はPluginの設定をしてあげるだけです。今回はcontentfulのリクエストをキャッシュしますので、下記のようになります。

```javascript:plugins/main-sw.js
workbox.routing.registerRoute(
  new RegExp(
    '^https://cdn.contentful.com/spaces/xw0ljpdch9v4/environments/master/*'
  ),
  workbox.strategies.staleWhileRevalidate({
    plugins: [
      new workbox.broadcastUpdate.Plugin({
        channelName: 'contentful',
      }),
    ],
  }),
  'GET'
);
```

`plugins`の項目が重要となります。まぁ、と言ってもぱっと見ればわかりますね。

この`channelName`がチャンネルの名前になります。後々必要になります。

## チャンネル自体にイベントリスナーを設定する

チャンネルを購読したいのですが、ここで[Broadcast Channel API]('https://developer.mozilla.org/ja/docs/Web/API/BroadcastChannel')を利用します。

> BroadcastChannel インターフェイスは、特定のオリジンの閲覧コンテキストが購読できる名前付きチャネルを表します。 それは、同じオリジンの異なるドキュメント間（異なるウィンドウ、タブ、フレーム、iframe）の通信を可能にします。 メッセージは、チャンネルをリッスンしているすべての BroadcastChannel オブジェクトで発生する message イベントを介して放送されます。

とのことです。WorkboxのbroadcastUpdateプラグインもこのBroadcast Channelに対してイベント（メッセージ）を送信します。

なので、下記のようにしました。ちなみにここは`created`メソッドの中です。

```typescript
const updatesChannel = new BroadcastChannel('contentful');
updatesChannel.addEventListener('message', event => {
  // do to update
});
```

eventには下記のようなデータが入っています（更新したデータは入ってないのであしからず）。

```json
data: {
  type: 'CACHE_UPDATED',
  meta: 'workbox-broadcast-cache-update',
  payload: {
    cacheName: 'the-cache-name',
    updatedUrl: 'https://cdn.contentful.com/...'
  }
}
```

今回はcacheNameなどの設定も行っていないので、適当に下記のようなプログラムになっていますが、実際はchannelNameやcacheNameなど、粒度別に与えて細かく設定してあげればより良くなるかと思います。あと、`$forceUpdate()`を書けてやらないと画面が更新されませんでした。

```typescript
const updatesChannel = new BroadcastChannel('contentful');
pdatesChannel.addEventListener('message', () => {
  fetchPosts(this.page, this.limit)
    .then((posts: MultipleItem<Post>) => posts.items)
    .then((posts: Post[]) => {
       this.posts = posts;
       this.$forceUpdate();
    });
  });
}
```

ここまで書いて気づきましたが、nuxtのサーバー側のキャッシュのせいで結局キャッシュが利用されちゃいます。明くる日か、また、キャッシュとの闘いを行いたいと思います。
