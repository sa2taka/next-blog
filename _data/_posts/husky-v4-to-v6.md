---
layout:      post
title:       Huskyをv6に上げたらcommitできずに動かない
author:      sa2taka
category:    typescript
tags:        npm,yarn,husky
public:      true
createdAt:   2021-04-05
updatedAt:   2021-04-16
latex:       false
description:
  Huskyをv6に上げたらcommitできなくなったので、解決方法とその理由について調べてみました。  
---

ハローワールド。

この前弊blogのライブラリ群をとにかく`$ yarn upgrade --latest`でアップデートしたところ、諸々動かなくなりまして。
基本的にはwebpack5関連で、なんとか動いたとcommitをしようとしたところ、エラーが発生してcommitできませんでした。

```
error Command "husky-run" not found.
```

gitのcommit時にはgit hooksを利用してlintやtestなどを行うのが常かと思います。私のblogも[husky](https://github.com/typicode/husky)を利用してyarn lintを走らせています。そのhuskyがどうやらエラーしている模様。

調べてみると**huskyはv4からv6にかけて大幅なアップデートがあった**ようです。公式でも[v4からv6のマイグレーションガイド](https://typicode.github.io/husky/#/?id=husky-4-to-6-cli)があるので、それで事足りるかと思いますが、当記事でも触れてみたいと思います。

# アップデート方法

`package.json`や`huskyrc.json`に皆さんのhuskyの設定があると思います。  
私の場合は下記のような感じでした。

```json:package.json
"lint-staged": {
    "*.{js,vue}": "yarn lint"
},
"husky": {
    "hooks": {
        "pre-commit": "lint-staged"
   }
},
```

v6に変更する場合はまず`.husky/`ディレクトリを作成します。  
そして、キーをファイル名としたシェルスクリプトを作成します。今回は`pre-commit`という名前のシェルスクリプトを下記のように作成しました。

```shell:.husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

yarn lint
```

そしてGithookを有効にするために下記コマンドを実行します。

```sh
$ npx husky install
# または
$ yarn husky install
```

自動的にGithookを有効にするために`package.json`を編集します。ただし、yarn v2は対応していないため、[yarn v2についてのガイド](https://typicode.github.io/husky/#/?id=yarn-2)を別途参照してください。

```json:package.json
"scripts": {
    ...
    "prepare": "husky install",
    ...
}
```

::: info
`package.json`の`prepare`スクリプトは特別なスクリプトの1つです。

npmドキュメントの[scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts)に記載がありますが、

> Runs on local npm install without any arguments
> > ローカル環境で引数無しで`npm install`を実行した時

のタイミング（他にもあります）で`prepare`スクリプトが実行されます。

また、いわゆるYarn v1でも[package.json](https://classic.yarnpkg.com/en/docs/package-json/)に下記の記載があるため動作します（強調は筆者）。

> Certain script names are special. If defined, the preinstall script is called by yarn before your package is installed. For compatibility reasons, scripts called install, postinstall, prepublish, and prepare will all be called after your package has finished installing.
>> 特定のスクリプト名は特別です。preinstall スクリプトが定義されている場合、パッケージがインストールされる前に yarn によって呼び出されます。互換性の理由から、install、postinstall、prepublish、**prepare**と呼ばれるスクリプトはすべて、パッケージのインストールが完了した後に呼び出されます。 
:::

`$ yarn husky install`をすることで、`.git/config`に`hooksPath = .husky`と設定が入るため、`.husky`フォルダに入れたhooksが適用されます。それによりgit hooksが上手く動くというわけです。

# 何故

ぱっと見ると、v4のほうが設定自体は簡単なような気がしますし、`.husky`というフォルダができてしまいます。

その辺りに関しては[Why husky has dropped conventional JS config](https://blog.typicode.com/husky-git-hooks-javascript-config/)にすべて記載があります。

以前のhuskyではgit hooksというhooksすべてを作成して、下記のシェルスクリプトを実行していました。

```
. "$(dirname "$0")/husky.sh"
```

実際に、例えば`.git/hooks/pre-commit`などを見てもらえば上記の定義となっているかと思います。

そこで`husky.sh`を読んでみると、今度は最終的に`yarn run husky-run $hookName`（$hookNameは例えばpre-commitなど）を実行しているような動きでした。しかしながら、これでは実行するものがなくてもすべてのhookが動いていまいます。何も動かないならまだしも、必ず`yarn run husky-run`を動かすわけですね。

そして[git 2.9](https://github.blog/2016-06-13-git-2-9-has-been-released/)がやってきました。

> You can now specify a custom path for hooks

`yarn husky install`ではこのhooksのカスタムパス機能を利用して`.husky`フォルダをhooksのパスとして登録します。
今まで`.git/hooks`という亜空間で定義していたものが`.husky`というフォルダに移ってきました。こうすることで無駄なくgit hooksを定義できます。

`.husky`ってフォルダ名が嫌だ、とか「じゃあhusky要らなくない？」とかいった疑問も[Why husky has dropped conventional JS config - but](https://blog.typicode.com/husky-git-hooks-javascript-config/#but)に記載があるので気になった方は読んでみてください。
