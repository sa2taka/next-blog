---
layout:      post
title:       PRのベースブランチがmasterブランチにマージされたら自動でレビュー可能状態にするGithub Actions
category:    github-actions
author:      sa2taka
tags:        Github,Github Actions
public:      true
createdAt:   2022-12-27
updatedAt:   2022-12-27
latex:       false
description:
  非常にニッチなGithub Actionsの紹介。「ベースブランチがmainブランチなどにマージされたら、依存元のブランチもReady for Review状態にする」を自動化した。  
---

ハローワールド。

非常にニッチなGithub Actionsの紹介です。

Github（などのGit管理サービス）でのPull Requestの運用は千差万別だと思います。
弊チームではPRの粒度はある程度細かくする文化があります。そして、その結果として、1つの大きなまとまりを複数のPRに意味のある単位に分割することがよくあります。

例えば、1つの処理を作成する上で`firestoreからデータを取得する処理`、`データを変換する処理`、`変換したデータをAPIでデータを返す処理`みたいな感じに分割し、PRが3つ作成されます。流石にこの程度だと1つのPRにする可能性もありますが、1つ1つの処理が大きく、それぞれ意味的に分割できるのであれば分割します。
そして、それぞれをbranch1, branch2, branch3とした場合、branch3はbranch2に依存して、branch2にbranch1に依存して、という関係になります。

この時、branch1, 2, 3のブランチを同時にPRを作り、branch2のbaseブランチをbracnh1, branch3のbaseブランチをbranch2と設定します。
3つのPull Requestを開くのは良いのですが、例えば、branch2のPRがレビューされマージされてしまった場合、branch1にbranch2の内容が流れ込んでしまいます。
すでにレビュー済みのコミットは取り除くみたいな機能があれば良いんですが、Githubはそういうことはしないので、上記の場合であれば、branch2、branch3はマージはしたくないという状態です。

弊チームでは上記のようなPull Requestに依存関係がある場合は、依存元のPRをDraftモードにしてマージされないようにします。Draftにしてもレビュワーは振れるので、Draftにしてレビュワーを設定するという運用です。
そしてベースブランチがmainブランチなどにマージされたら、依存元のブランチもReady for Review状態にする、という運用です。

今回は、この「**ベースブランチがmainブランチなどにマージされたら、依存元のブランチもReady for Review状態にする**」を自動化しました。

# 完成品

```yaml
name: Auto Ready to Review
on:
  pull_request:
    types: [edited]
jobs:
  set-ready-to-review-if-possible:
    runs-on: ubuntu-latest
    permissions: 
      contents: write
      pull-requests: write
    if: ( github.base_ref == 'master' || startsWith(github.base_ref, 'feat/') || startsWith(github.base_ref, 'feature/') ) &&
        github.event.pull_request.requested_reviewers[0] != null &&
        github.event.pull_request.draft &&
        github.event.changes.base.ref.from != github.base_ref
    steps:
      - run: gh pr ready $PULL_REQUEST_NUMBER -R $REPOSITORY
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PULL_REQUEST_NUMBER: ${{ github.event.pull_request.number }}
          REPOSITORY: ${{ github.repository }}
```

# 解説

github actionsは非常に[ドキュメント](https://docs.github.com/ja/actions)が豊富なため、若干APIなどが読みづらいなどもありますが、ある程度わかりやすいと思います。が、一応パートごとに解説していきます。

## トリガー

```yaml
on:
  pull_request:
    types: [edited]
```

上記はトリガーです。今回はPull Requestが編集されたら実行されます。

Githubではベースブランチがマージされたら、自動でベースブランチが変更されるという挙動があります（参考： [[GitHub] Pull RequestのBaseブランチが自動で変更されるようになっていた | DevelopersIO](https://dev.classmethod.jp/articles/base-branch-of-pull-request-was-supposed-to-be-changed-automatically-in-github/)）。この挙動のときも上記のトリガーはちゃんと動作します。そのため、ほぼ自動で上記のActionが発生します。

## permission

```yaml
    permissions: 
      contents: write
      pull-requests: write
```

draft状態をreview可能状態にするためには、`pull-requests`以外に`contents: write` が必要らしいです。ここに関してはドキュメントが一切無かったためなぜかは不明でした。

## 条件

```yaml
    if: ( github.base_ref == 'main' || startsWith(github.base_ref, 'feat/') || startsWith(github.base_ref, 'feature/') ) &&
        github.event.pull_request.requested_reviewers[0] != null &&
        github.event.pull_request.draft &&
        github.event.changes.base.ref.from != github.base_ref
```

実行する条件です。

1行目は、ベースブランチのブランチが何かを確認しています。チームごとに運用は違うと思いますが、弊チームでは`main`ブランチか、また大きな機能であればfeatureブランチと呼ばれるブランチに一旦処理をまとめるようにしています。その際のブランチ名の規則として`feat/`または`feature/`から始まるようにしているためそれを反映させています。

2行目はレビュワーが存在しているかどうかを確認しています。Github Actionsには配列の長さを取得するような関数はないため、配列の最初の項目がnullであれば空、nullじゃなければ空ではないとしています。

3行目はdraftかどうかを確認しています。

4行目は今回のPullRequestの変更でベースブランチが変わったかどうかを確認しています。

## 動作

```yaml
   steps:
      - run: gh pr ready $PULL_REQUEST_NUMBER -R $REPOSITORY
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PULL_REQUEST_NUMBER: ${{ github.event.pull_request.number }}
          REPOSITORY: ${{ github.repository }}
```

いろんなドキュメントを参考にすると[github/scripts](https://github.com/actions/github-script)を利用する例が見られます。が、github/scriptsはGithubのREST APIを実行します（正確には[octokit/rest.js](https://octokit.github.io/rest.js)）。
ですが、REST APIではなぜかDraft状態を更新できない（作成はできるのに）。困りましたね。

ということで`gh`コマンドを利用することで代替します。ghコマンドはGithubのCLIであり、Githubの [GraphQL API](https://docs.github.com/ja/graphql)を利用します。そのため、こっちだとDraft状態を更新できます。

具体的な利用方法は `env`に`GITHUB_TOKEN` として `${{ secrets.GITHUB_TOKEN }}`を保存するだけです。`gh`コマンドは特に何もしなくても動きます。`runs-on`次第かもしれませんが。

また、この`GITHUB_TOKEN` は [自動トークン認証のページ](https://docs.github.com/ja/actions/security-guides/automatic-token-authentication)に記載されていますが、ワークスペースの設定または`permission`の権限を持つようになります。今回は`permission`で最低限の設定しています。
