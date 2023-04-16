---
layout:      post
title:       Hello, Deno!! ～ 新たなJavaScript実行環境であるDenoを試してみる 
author:      sa2taka
category:    memo
tags:        Deno,Node,JavaScript,TypeScript
public:      true
createdAt:   2020-05-15
updatedAt:   2020-05-15
latex:       undefined
description:
  Node.jsの作者が新しく作ったJavaScriptおよびTypeScriptの実行環境であるDeno。そんなDenoのバージョン1がリリースされましたので、紹介とインストール、ハローワールドまで試してみました  
---

ハローワールド。

[Node.js](https://nodejs.org/ja/)は今はJavaScript界隈で知らない人はいない程有名だと思います。
[V8 JavaScriptエンジン](https://v8.dev/)で動作する[^node-with-chackra]JavaScript環境で、ネットワークアプリケーションを作成するのを主として、今やデスクトップアプリやIoTデバイスとしても動いています。
そんな、Node.js、2018年にNode.jsの作者であるRyan Dahl氏が「[Node.jsに関する10の反省点](https://www.youtube.com/watch?v=M3BM9TB-8yA)」(邦題)というタイトルのセッションを行っています。
具体的な内容は、いくつか翻訳や説明記事が出ているのでそちらに任せるとして、その中で「Deno」というプロダクトについて言及しています。

あくる日か、枝の節々(Node)を食べる恐竜(Deno)が現れるのでしょうか。調べていきましょう。

[^node-with-chackra]: Chackra Coreで動くNode.jsなどもあります(https://github.com/nodejs/node-chakracore)

# Deno

[Deno](https://deno.land/)は`A secure runtime for JavaScript and TypeScript.`の説明の通り、JavaScript、および**TypeScript**の実行環境です。
何を隠そう、このDenoの作成者はNode.jsの作成者でもあるRyan Dahl氏が作成したプロダクトです。NodeとDeno...見比べると、似ていますもんね。

そんなDenoですが、2020年5月13日に[Deno1.0](https://deno.land/v1)がリリースされました。
正直に言うと、Deno1.0のニュースを見て初めて知ったのですが、これを機にDenoについて色々調べて行きたいと思います。

## Denoの特徴

DenoはNode.jsと同じでV8 JavaScriptエンジン上で動作するJavaScriptおよび**TypeScript**環境で、[公式サイト](https://deno.land/)によると以下の特徴があります。

>- Secure by default. No file, network, or environment access, unless explicitly enabled.
Supports TypeScript out of the box.
> - Ships only a single executable file.
> - Has built-in utilities like a dependency inspector (deno info) and a code formatter (deno fmt).
> - Has a set of reviewed (audited) standard modules that are guaranteed to work with Deno: deno.land/std
> > (ほぼ直訳)
> > - デフォルトで保護されてします(セキュアバイデフォルト)。明示的に有効にされていない限り、ファイル、ネットワーク、環境へのアクセスは出来ません。
> > - TypeScript をサポートしています。
> > - 単一の実行ファイルのみをリリースします
> > - 依存関係インスペクタ (deno info) やコードフォーマッタ (deno fmt) などの組み込みユーティリティを持っています。
> > - Denoでの動作が保証されている、レビュー済み（監査済み）の標準モジュールのセットを持っています: deno.land/std

文字通りですので解説はとりあえずやめておきます。

## Node.jsとの違い

[DenoのManualの"Comparison to Node.js"](https://deno.land/manual#comparison-to-nodejs)によると、下記の違いがあります。

- npmを利用しません -- URLまたはファイル参照として指定されるモジュールを利用します
- package.jsonをモジュール解決アルゴリズムとして使用しません

Node.jsではパッケージ管理ツールとしてnpmを利用して事前にダウンロードしますが、Denoは実行時にモジュールを指定します。
Node.jsではモジュールはフォルダ単位です。ですが、Denoではモジュールは「単一ファイル」です。そのためDenoでは下記のようにURLやファイル指定で単一ファイルを指定してモジュールを取得してきます。

```typescript
import * as log from "https://deno.land/std/log/mod.ts";
```

- Denoのすべての非同期アクションはPromiseを返します。したがって、DenoはNodeとは異なるAPIを提供します。

現在のNode.jsはPromiseを利用できますが、かなり昔(といっても数年前でしょうか)はCallback地獄とも呼ばれる、callbackに次ぐcallbackの連鎖によって非同期アクションを行っていました。正直、私がJavaScriptを真面目にやりだしたのはここ最近なので、いわゆるレガシーなJavaScriptのお作法なんかはわからないので、あまり言及しないことにします。
Denoでは全てPromiseを返すので、地獄を見ないで済むようです。

- Denoでは、ファイル、ネットワーク、および環境へのアクセスに明示的な権限が必要です。

これは上記の特徴にも書きましたが、Secure by defaultの精神で、明示的な権限がないとアクセスが出来ないようです。

- Denoはキャッチされないエラー(uncaught errors)が起きたら必ず落ちます

あまりNode.jsに詳しくないので、もしかしたら違うかもしれませんが、非同期アクション上でuncaught errorsが起きた場合、Node.jsでは落ちないような仕組みになっているのでしょうか。Denoでは落ちる、と。

- `require()`をサポートせず、ESモジュールを利用します。サードパーティモジュールを利用する場合はURLを指定します。

上記に書いたので省きますが、Node.jsの`require`ではなく、ES6のモジュールを利用するようです。


# Denoを試してみる

ではDenoでHello, Worldを行ってみます。

## インストール

[Installation](https://deno.land/manual/getting_started/setup_your_environment)のページを参考にしてインストールします。

Windowsに入れようと思いましたが、まだNode.jsあたりのエコシステムに頼っている節があるので、Node.jsが入っているWSLのUbuntuの中に入れました。Windowsでもmac OSでも簡単に入れられるので、上記ページを参考にしてください。

```bash
$ curl -fsSL https://deno.land/x/install/install.sh | sh
...
unzip: not found
```

あ、はい...

```bash
$ sudo apt install unzip
$ curl -fsSL https://deno.land/x/install/install.sh | sh
``` 

インストールの最後に環境変数に入れるよう指示があるので指示通りに行います。
bashであれば指示通りに、fishであれば下記の様に。

```fish:~/.config/fish/config.fish
...
set DENO_INSTALL /home/<ユーザー名>/.deno
set PATH $DENO_INSTALL/bin $PATH
```

実行できるかどうかを確認して終了です。

```bash
$ deno --version
deno 1.0.0
v8 8.4.300
typescript 3.9.2
```

## 環境セットアップ

[Setup your environment](https://deno.land/manual/getting_started/setup_your_environment)を参照して環境のセットアップを行います。

### 補完(Completions)の設定

`deno completions`コマンドで様々なシェルの補完用の設定を出力できます。fish用であれば下記のコマンドで設定可能です。

```fish
$ deno completions fish >~/.config/fish/completions/deno.fish
```

### VSCodeの設定

公式ではVSCodeとIntellJ IDEが書いてありますが、今回はVSCodeを利用します。というのも、まともに動くの多分VSCodeだけ。中身はJavaScriptやTypeScriptなんで頑張れば動くかもしれませんが。

[こちら](https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-deno)をインストールします。

## ハローワールド

ではハローワールドの時間です。

まず適当なファイルを作ります。denoではキャメルケースでファイル名をつけるらしいので、`hello_world.ts`ファイルを作りましょう。

```typescript:hello_world.ts
console.log("Hello, Deno!!🦕");
```

で、

```bash
$ deno run ./hello_world.ts 
...
Hello, Deno!!🦕
```

これだけ。
気づきました? TypeScriptがなんの設定もなしで動くの。感動しますね。

今回はハローワールドまで!　こんな単純なプログラムではなくって、もう少し一歩先に進んだプログラムを今後書いて投稿して行きたいと思います。
