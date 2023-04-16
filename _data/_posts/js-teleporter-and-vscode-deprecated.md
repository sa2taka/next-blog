---
layout:      post
title:       JSのテストを行き来するVScode拡張が強くなった報告とVSCode拡張のdeprecatedについての小話
author:      sa2taka
category:    typescript
tags:        javascript,typescript,vscode
public:      true
createdAt:   2022-11-20
updatedAt:   2022-11-20
latex:       false
description:
  JS go to test 改め JS Teleporter を作成した報告。VSCode拡張のdeprecateフラグを付ける方法がGithub discussionでコメントする方法しか無かったのが意外だったので小話を記載しました  
---

ハローワールド。

以前[JavaScript/TypeScriptでテスト・コード間を移動するwith VSCode拡張の作り方](https://blog.sa2taka.com/post/javascript-typescript-jump-between-test-and-code-with-vscode/)というファイルで、私謹製の js-to-to-test という拡張を作成した話をしました。
これはJavaScript/TypeScriptのコードとテストをいい感じに行き来してくれる拡張です。

# 強化ポイント

訳合って、拡張の名前が変わっています(理由は後術)。

[JS Teleporter - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-teleporter)

まず、以前書いたときには無かった機能として、テストファイルが無かったらファイルを作成するかどうか聞かれ、作成する場合はいい感じの場所にファイルを作成するようになりました

また、Storybookに対しても同様に行き来できる機能を追加しました。

![Storybookを行き来する機能のgif](https://user-images.githubusercontent.com/13149507/202853523-a58ac81d-6981-47cd-afbe-821cdf19ba29.gif)

# VSCodeの拡張、deprecatedの難易度が高すぎる

本題は以上です。

今回、Storybookを行き来する機能を作成しようと思ったタイミングで拡張の名前と機能が一致しなくなってしまうのがネックでした。拡張の名前はjs-go-to-testですが、Storybookも行き来できてしまうのはなんとなく気持ち悪い。

というわけでまずは名前の変更を考えたのですが、これは調べた限り無理そうでした。サポートに連絡すればもしかしたらなんとかしてくれるかもしれませんが、バージョンも0.2とかなので、新しく拡張を作ろうと思いました。

ref: https://stackoverflow.com/questions/49209327/if-i-change-my-vs-code-extensions-name-will-i-lose-the-downloads-statistics

そして完成して、古い方は `deprecated` フラグをつけようかなぁと思って調べたところ、一切その方法が記載されていませんでした。
色々探したところ、公式の拡張機能の公開のページに次の記載がありました。

https://code.visualstudio.com/api/working-with-extensions/publishing-extension#deprecating-extensions

> In order to mark your extension as deprecated, please reach out to us by commenting [here](https://github.com/microsoft/vscode-discussions/discussions/1).
> > 拡張機能を非推奨とする場合、[ここ](https://github.com/microsoft/vscode-discussions/discussions/1)に連絡してね

まさかのGithub discussionで管理しているとは...。ただ、拡張機能は結構deprecatedになっているのにも関わらず、disscussionは200程度しかコメントが付いていないので、サポートに連絡しても良さそうです。

eTLD(Public Suffix)が[GithubのPRベース](https://github.com/publicsuffix/list)でサポートされてることを知った以来の衝撃でした。
