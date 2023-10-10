---
layout:      til
title:       Unicode正規化
category:    unicode
createdAt:   2023-10-10
updatedAt:   2023-10-10
---

言語処理の文脈で、度々Unicode正規化という言葉を聞く。言葉や処理自体は知っていたが、いくつか種類があるようなので改めて調べてみた。

[Wikipediaによると](https://ja.wikipedia.org/wiki/Unicode%E6%AD%A3%E8%A6%8F%E5%8C%96)

> Unicode正規化（ユニコードせいきか、英語: Unicode normalization）とは、等価な文字や文字の並びを統一的な内部表現に変換することでテキストの比較を容易にする、テキスト正規化処理の一種である。

具体的に、正規化には4種類ある。

- NFD
- NFC
- NFKD
- NFKC

末尾のD・CはそれぞれDecomposition（分割）・Composition（結合）である。Dの場合は正規化した上で分解したまま、Cの場合は分解した後結合する。
Kの有無だが、これは正準等価（K無し）・互換等価（K有り）の違いらしい。具体的には調べていないが、正準等価に比べ互換等価の方が緩く分解されるらしい。

JavaScriptにおいては`String`に`normalize`メソッドが生えているため、それを利用することでノーマライズが可能である。

```shell
$ node
> const char = "ｷﾞ"
undefined
> char.normalize("NFD")
'ｷﾞ'
> char.normalize("NFC")
'ｷﾞ'
> char.normalize("NFKD")
'ギ'
> char.normalize("NFKD").length
2
> char.normalize("NFKC")
'ギ'
> char.normalize("NFKC").length
1
```
