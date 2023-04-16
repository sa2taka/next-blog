---
layout:      post
title:       yarnを行うと「info There appears to be trouble with your network connection. Retrying...」が出てくる
author:      sa2taka
category:    memo
tags:        yarn ,エラー解決
public:      true
createdAt:   2020-05-22
updatedAt:   2020-07-05
latex:       undefined
description:
  yarnを行うと「info There appears to be trouble with your network connection. Retrying...」が出てくるので解決した。  
---

ハローワールド

# 事象

yarnを実行するとこんなエラーが出続ける。

```bash
$ yarn 
...
info There appears to be trouble with your network connection. Retrying...
info There appears to be trouble with your network connection. Retrying...
info There appears to be trouble with your network connection. Retrying...
...
```

# 原因と解決

ネットワークが遅いためタイムアウトエラーが発生している、とのこと。

なのでタイムアウト時間をめちゃめちゃ長くしてあげましょう。

```bash
$ yarn config set network-timeout 1000000
# or
$ yarn install --network-timeout 1000000
```

`Ubuntu on WSL`と書いてありますが、おそらくどこだって同じだと思います。
