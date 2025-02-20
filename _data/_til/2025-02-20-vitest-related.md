---
layout:      til
title:       Vitestで「そのファイルに関連したテスト」を書く
category:    test
createdAt:   2025-02-20
updatedAt:   2025-02-20
---

タイトルの方法は `vitest related` という命令により可能です（[vitest relatedのドキュメント](https://vitest.dev/guide/cli#vitest-related)）。これはファイルを指定すると、そのファイルに関連したテストを実行するものです。

関連というのはドキュメント上であまり明示されていませんが、基本的には該当のファイルをimportしたテスト、さらにimportした別のファイルをimportしたテスト、さらにimportしたやつをimportしたやつをimportしたテスト...みたいな感じで再帰的になんかいい感じに引っ張って来るようなイメージがあります。ですのでファイルによっては1ファイル指定しただけなのに何十ファイルもテスト対象になります。

例えば [派生元ブランチを取得する](https://blog.sa2taka.com/til/2025-02-20-improve-get-base-branch/)を利用すると、該当のブランチで編集したすべてのファイルに関連したテストを実行できます。

```bash
$ yarn test related --run $(git diff $(git show-branch | grep -e '*' -e '-' | grep -v -e '^\s*!' -e '^-' -e "$(git rev-parse --abbrev-ref HEAD)" | head -1 | awk -F'[]~^[]' '{print $2}') --name-only | grep -e '\.ts$')
# aliasで派生元ブランチの取得を `git parent-branch` とするとスッキリします
$ yarn test related $(git diff-file-from-parent | grep -e '\.ts$')
```

ちなみにモノレポの場合、先頭に`packages/app`みたいなパスが付与されているとファイルの指定がうまくいかないので、`sed`で編集するといいです。もしくは[root](https://vitest.dev/guide/cli#root)オプションを利用しても良いと思います。

```bash
# aliasで派生元ブランチの取得を `git parent-branch` としています
$ yarn test related $(git diff-file-from-parent | grep -e '\.ts$' | sed 's#^packages/app/##')
```

:::info
`sed`の形が気持ち悪いですね。sedの区切り文字は何でも良いので、パスを利用する際は `#`が一般的らしいです。
:::
