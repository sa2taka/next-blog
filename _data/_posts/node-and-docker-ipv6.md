---
layout:      post
title:       Node.jsでDockerと通信できない場合がある
category:    programming
author:      sa2taka
tags:        javascript,node,docker
public:      true
createdAt:   2023-07-29
updatedAt:   2023-07-29
latex:       false
description:
  Node.js v18 (v17) から ipv4を優先する設定がfalseとなったため、localhostの解決がipv6となり通信が出来ないようになったため、解決した。
---

nodeのバージョンをv18に上げたところ、テストのDB環境を構築するDockerと通信が出来ずにエラーになる場合が発生した。

# 結論

node v17よりdnsの名前解決のためのオプションの [`--dns-result-order`](https://nodejs.org/api/cli.html#--dns-result-orderorder) のデフォルトの設定が変わっていて、ipv6のIPアドレスを取得する場合が発生するようになった。

`localhost` にアクセスする際、IPアドレスを `[::1]` と判断されると、ipv6でアクセスできない場合はアクセスできない。

簡易的な解決方法としては下記の2つとなる。`hosts`ファイルを書き換える選択肢も無い事にはない。

- `localhost`で指定している部分を `127.0.0.1` とする。
- `node` 実行時オプションに `--dns-result-order=ipv4first` を設定する
     - または `NODE_OPTIONS` 環境変数に `--dns-result-order=ipv4first` を設定する
