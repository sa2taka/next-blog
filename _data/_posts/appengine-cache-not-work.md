---
layout:      post
title:       AppEngineでキャッシュの動作がおかしい問題
category:    memo
author:      sa2taka
tags:        appengine,next.js
public:      true
createdAt:   2023-06-18
updatedAt:   2023-06-18
latex:       false
description:
  AppEngineではファイルの作成時間が固定となり、場合によってはキャッシュが動作しない事がある。それについてまとめた。 
---

AppEngine上にデプロイしたNext.jsのアプリで、キャッシュがうまく動作しない事象が発生しました。
結論として、この問題はAppEngine上の問題で解決は不可能で回避するしかありませんでした。

本記事ではこの問題について記載していきます。

# 環境と現象

今回は下記の環境によって作成しています。

- Next.js v13 (13以下であればおそらく全て同じ)
- AppEngine
  - standard環境 (flexibleでは確認していない)
  - nodejs18（16でも同じ、nodejs以外でも同様の問題が発生する）

再現用に下記のリポジトリを用意しました。

[appengine-cache-test](https://github.com/sa2taka/appengine-cache-test)

今回問題が発生するのは `puclic`ディレクトリのファイルです。
今回は、下記のようなファイルを作成しました。

```html:public/dummy.html
<p>Hello?????</p>
```

next.jsでは`public/`以下のファイルは静的ファイルとして公開できます。実際に`/dummy.html`にアクセスしてみるとちゃんと表示されています。

![dummy.htmlの初回アクセス結果](../_images/dummy.htmlの初回アクセス結果.png)

アクセスして気づきました「！じゃなくて？になっている！」と。
そして、下記のようにファイルを修正してみました。

```html:public/dummy.html
<p>Hello!!!!!</p>
```

そして再デプロイして……デプロイ完了。見てみましょう。

**あれ、変わらないぞ...？**

キャッシュを無効化してリロード（Ctrl-Shift-RとかCmd-Shift-R）を行うとうまく表示されます。つまりキャッシュが効いているような気がするのですが...一体なんででしょうか。

# 理由と解決方法

この現象の理由ですが、Next.jsの静的ファイルのETagの生成アルゴリズムと、AppEngineの特性によって引き起こされています。

## 理由

上記の現象、ぱっと見るとクライアントキャッシュが利用されていることが原因に見えます。しかし、レスポンスをよく見ると、キャッシュコントロールは実質利用できない状態になっています。

```
Cache-Control: public, max-age=0
```

`max-age`が0というのは、0秒間キャッシュを使ってもいいよという意味であり、キャッシュは無条件で使えません。
ただ、レスポンスステータスコードを見ると`304`です。これは「変更はありませんのでキャッシュを使ってください」という意味です。
これによりブラウザはローカルキャッシュを使います。

:::info
Cache-Controlの設定は字面から受け取る印象と大きく異なります。

有名な話だと、`Cache-Control: no-cache`は、キャッシュを利用しないようの指示に見えますが、実際にはキャッシュを保存します。
本当にキャッシュを保持しない設定は `Cache-Control: no-store` です。

これは[RFC9111](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.4)に記載されています。

では`no-cache`は何なのかというと、サーバー側に必ずキャッシュが有効かどうかを問い合わせる必要がある、という意味です。具体的には`no-cache`のリソースに関しては「このキャッシュって有効ですか？」と聞いて、`304`が返ってきた場合に利用できます。

`no-store`はそもそもキャッシュを保存しません。この挙動は機密データを含むデータに関しては非常に重要です。機密データを含む場合は`no-cache`ではなく`no-store`を利用するようにしましょう。そうしないと、キャッシュがコンピューターに保存され、最悪漏洩する可能性があります。

`max-age: 0`は何の意味があるのかですが、これは`no-cache`とほぼ同じ意味です。唯一の違いは[Serving Stale Responses](https://www.rfc-editor.org/rfc/rfc9111.html#name-serving-stale-responses)に記載があるように、サーバーに接続できない場合などの場合、キャッシュを利用してよいかどうかの部分です。`no-cache`以外にも`must-revalidate`も同じ制約がかかるため `no-cache` と `public, max-age: 0, must-revalidate`はおそらく同じような挙動になるのかと考えられます。
:::

つまり問題はサーバー側が`304`を返すこととなります。

次に考えるのは、何故`304`を返すのでしょうか。いくつか理由はありますが、今回は`ETag`が原因です。[`ETag`](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/ETag)ヘッダーは、リソースのバージョンを表すものです。AppEngineではETagが同一なものに関して自動的に304を付与するようです。正確にはEdge Cacheという機能がGCPにはあるらしいのですが、公式の説明が全く見当たらないため挙動から想像しています。
今回はレスポンスを見る限り古い値と新しい値とでETagの値が同一であるため、それが原因と推測できました。

```
Etag: W/"16-49773873e8"
```

つまり、このETagが生成されるのが問題ということですね。ETagを生成するのはAppEngine（EdgeCache）でしょうか？Next.jsでしょうか？どんなに調べてもEdgeCacheについて情報がなかったので、とりあえず今回はNext.jsの生成に問題があると考えました。

コードを読んでみるとNext.jsには2通りのETagの生成があります。
1つ目は、pages（app directoryも同じかも）に記載している部分に関するETagの生成。もう1つが静的ファイル、すなわち`public/`以下に対するものです。

詳しくは記載しませんが、ソースコードを追うと`public/`以下の静的ファイルは[`send`](https://www.npmjs.com/package/send)というパッケージを利用して公開していることがわかります（正確には、next.js内部にコンパイル済みの`send`がある。そのため`package.json`の依存にはない）。この`send`パッケージは内部で[`etag`](https://www.npmjs.com/package/etag)パッケージを利用しています。

この`etag`は2つのETagの生成方法がありますが、利用されているのはファイルの`stat`を利用した方法です。
ETagの生成は簡単に言えば下記のようなものになっています。

```
W/"<16進数のファイルサイズ>-<16進数の作成時刻（ミリ秒付きのUnix時間）>"
```

ETagの後半部分である`49773873e8`を10進数になおして見ると`315,532,801,000`。ミリ秒付きなので`315,532,801`。これをUnix時間として変換すると`1980-01-01 00:00:01`という謎の時刻になります。しかし、なんとなく見えてきましたね。この作成時刻がAppEngineの環境では一定なのでETagが同一になると。

結論として、AppEngineの仕様として、ファイルの作成時刻が `1980-01-01 00:00:01` になるということらしいです（[https://issuetracker.google.com/issues/168399701#comment11](https://issuetracker.google.com/issues/168399701#comment11)）[^why]。

[^why]: 何故1970年じゃないのか、何故01秒なのか...。

すなわち、**AppEngine上では作成日をもとにしたETagは同一になる可能性がある**ということです。今回の場合はファイルサイズが変わっていないため、同一と判定されたんですね。


## 回避策

いくつかありますが、最も簡単で最も網羅的なのは、キャッシュを無効化することです。

例えばNext.jsの場合は`next.config.js`に`headers()`関数を定義すれば、ヘッダーを修正することが出来ます。


```typescript:next.config.js
async headers() {
    return [
      {
        source: "/dummy.html",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
    ];
  },
```

`s-maxage`なども動作すると思うので、設定値はお好みで。

他にも、ファイルサイズを常に変えるようにするなどもあります。
