---
layout:      post
title:       git commit --amendを使わずに特定のコミットの内容を修正する
category:    git
author:      sa2taka
tags:        git
public:      true
createdAt:   2023-11-04
updatedAt:   2023-11-04
latex:       false
description:
  2つ前のコミットを修正する際、git commit --amend を使わずに修正します
---

コーヒーと共に優雅なコーディングに没頭。適宜コミットをしていると、あるタイミングで「この変更、2つ前のコミットにまとめたいな」という場合ありますよね。
そのようなことを行いたくてGoogleで検索してみると、大体git rebase -iで対象のコミットまで行って、git commit --amendで修正している記事が多いです。

これより手数の少ない方法が`git commit --fixup`と`git rebase -i --autosquash`を利用した方法です。

1. 現在の修正を`git add`でステージングに追加します。
2. `git log --oneline`などを利用して、混ぜ込みたい対象のコミットのコミットハッシュをコピーします。
3. コピーしたコミットハッシュを使って`git commit --fixup <対象のコミットのコミットハッシュ>`コマンドを実行します。そうすると`!fixup <対象のコミットのタイトル>`というコミットが作成されます。
4. `git rebase -i --autosquash <対象のコミットのコミットハッシュ>~` を実行します。
    - 注意点としては、`-i`オプションを設定すること・対象のコミットもrebase対象に含める必要があるため、コミットハッシュの末尾に`~`をつけることです。
