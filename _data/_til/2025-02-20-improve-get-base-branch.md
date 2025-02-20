---
layout:      til
title:       派生元のブランチを取得する
category:    git
createdAt:   2025-02-20
updatedAt:   2025-02-20
---

Gitブランチの派生元・ベースブランチ・親ブランチ的なものを取得したくなることがあり、調べました。[Gitで今のブランチの派生元ブランチを特定する](https://qiita.com/upinetree/items/0b74b08b64442f0a89b9)などで紹介されている方法があります。

```bash
$  git show-branch | grep '*' | grep -v "$(git rev-parse --abbrev-ref HEAD)" | head -1 | awk -F'[]~^[]' '{print $2}'
```

ただ、私の環境ではそれだけでは動作しなかったので、以下のようにしました。

```bash
$ git show-branch | grep -e '*' -e '-' | grep -v -e '^\\s*!' -e '^-.*-$' -e "$(git rev-parse --abbrev-ref HEAD)" | head -1 | awk -F'[]~^[]' '{print $2}'
```

変更点は真ん中の`grep`のみです。

# 深堀り

上記は結論ですが、どうしてこうなるかを説明します。

## git show-branch

上記を深ぼるためには[git show-branch](https://git-scm.com/docs/git-show-branch)の出力を知る必要があります。様々な記号がブランチ名とコミット名の先頭に付与します。

- `*` は現在のブランチです。ブランチのHEADにつくのではなく、現在のブランチが持つ全てのコミットに付与されます
- `-` はマージコミットです。何故か`*`では無いです。これのせいで`grep '*'`だけでは取得できません。特にmainブランチがマージコミットのみというプロジェクトもあるでしょう
- `!` は現在のブランチ以外のHEADコミットです。そのためこれを除外すれば自分のブランチのみを取得できます
- 番外編として`---`をご紹介。git show-branchの出力はHEADコミットとその親コミットの間に`---`が入ります

ドキュメントの例を見てみてもそんな感じです（ここにマージコミットの存在がありませんが）。

```
$ git show-branch master fixes mhf
* [master] Add 'git show-branch'.
 ! [fixes] Introduce "reset type" flag to "git reset"
  ! [mhf] Allow "+remote:local" refspec to cause --force when fetching.
---
  + [mhf] Allow "+remote:local" refspec to cause --force when fetching.
  + [mhf~1] Use git-octopus when pulling more than one head.
 +  [fixes] Introduce "reset type" flag to "git reset"
  + [mhf~2] "git fetch --force".
  + [mhf~3] Use .git/remote/origin, not .git/branches/origin.
  + [mhf~4] Make "git pull" and "git fetch" default to origin
  + [mhf~5] Infamous 'octopus merge'
  + [mhf~6] Retire git-parse-remote.
  + [mhf~7] Multi-head fetch.
  + [mhf~8] Start adding the $GIT_DIR/remotes/ support.
*++ [master] Add 'git show-branch'.
```

## grep

git show-branchの説明を読めばgrepの意味は大抵わかります。

大元では `*` を含むもののみとしていましたが、そうするとマージコミットが含まれませんので、`-` も含めるようにしました。
ただ、gitのブランチ名などでは`-`は一般的に利用されるため、先頭の自分以外のコミットなどが含まれてしまいます。そのため、`"\\s*!` の正規表現により除外するようにしました。
またはHEADコミットとその親コミットの間に`---`が入りますが、`-`の行を含むようになったためにこの邪魔な分割線も含まれるようになったため、`'^-.*-$'` によってこれも除外するようにしました。ちなみに `^-+$` でやってみたらなんか動かなかったのでこうしてます。
大本にもありますが、`git rev-parse --abbrev-ref HEAD`によって現在のブランチを取得し、それを除外することを行っています。現在のブランチを取得する方法は[get current branch name](https://qiita.com/sugyan/items/83e060e895fa8ef2038c)という記事に何個か載ってます。

これにより一番上に存在するのは「**自分の持つコミットの中で、自分しか持っていないコミットを除いた一番上のコミット**」になります。コレを派生元ブランチとしているわけですね。`head -1`で一番上の行を取得するので、後はそこからブランチ名を取得するだけです。

## awk

`awk`以外の方法もあると思いますが、大元がそうしているんでその方法に倣ってます。

正直`awk`は雰囲気で使っていたので、何故`awk -F'[]~^[]' '{print $2}'`みたいに `[]` を2つ使っているのかわからなかったです。諸々調べると`-F`は正規表現が指定できるらしいですね。なので、一見 `[]`が2つあるように見えますが、実際には `[]^~` のうちどれかの文字、というのを表すために利用しているようです。`[][~^]` と書いても同じです。
