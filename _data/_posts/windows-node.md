---
layout:      post
title:       WindowsにNodeをインストールする
category:    memo
author:      sa2taka
tags:        Node,Windows
public:      true
createdAt:   2020-05-20
updatedAt:   2020-05-22
latex:       undefined
description:
  これ記事にする必要なくない? ってぐらい薄い生地。ピザでも作れそう  
---

ハローワールド

タイトル通り。

# Node.jsのダウンロード

[Node.jsのホームページ](https://nodejs.org/ja/download)から最新版をダウンロード。

ダウンロード後インストール。

```powershell
$ node -v
v10.20.1
```

...あれ？　もう既にnode入ってたみたい

```powershell
$ where node
C:\Program Files\node\node-v10.20.1-win-x64\node.exe
C:\Program Files\nodejs\node.exe
```

Win+Rで`appwiz.cpl`を打ってプログラムと機能の一覧を見てみる。無い。
エクスプローラーで開いてみる。5/10。10日前のことなのに覚えてない。多分Windows版のGitをインストールしたら勝手についてくるんだろう（あいつbashもくっついてくるから）。削除。

# yarnのダウンロード

```powershell
$ npm install -g yarn
$ yarn -v
1.22.4
```

僕はyarnが好きなのでyarnを入れるんですが、これをやるたびに、Winの環境構築でIEでchromeをダウンロードする行為を思い出します。
