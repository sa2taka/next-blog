---
layout:      post
title:       Raycast というmacOSのランチャーツールの答えの1つ 〜 Alfredから乗り換えてみる
author:      sa2taka
category:    memo
tags:        macOS
public:      true
createdAt:   2022-02-14
updatedAt:   2022-02-14
latex:       false
description:
  RaycastというMacのランチャーツールのエクスペリアエンスが高かったので紹介記事です。ついでにAlfredから乗り換えたときの備忘録的な。  
---

ハローワールド

[Alfredの代替としてRaycastを使っている - 詩と創作・思索のひろば](https://motemen.hatenablog.com/entry/2022/02/raycast)という記事が話題になっていました。
私も仕事でMacを使っているので、試してみたところメチャメチャ満足度が高かったです。

私自身はAlfreadのPowerpackを購入しており、ヘビーユーザーとまでは言いませんが、Alfreadに頼っている部分も多いです。Workflowも自作したり。

メチャメチャ便利なのですが、あまりRaycastに関する説明、特にAlfreadの代替として使うために、みたいな部分があまりなかったので本記事ではRaycastの推しポイントとAlfreadからの移行を中心的に見ていきます。

# Raycast紹介

[Raycast](https://www.raycast.com/)はいわゆるSpotlightのようなランチャーツールです。SpotlightはMacに最初からいるやつですが、似たアプリとしてはAlfredが挙げられます。
SpotlightやAlfredもそうですが、任意のコマンド（`Ctrl + Space`とか`Opt + Space`とか)で開いて、そこからアプリを開いたり色々できるってやつですね。

Raycast自身はAlfredと比べるとUIこそ大きく違いますが、無料版のAlfredでできることは代替できて、有料のPowerPackの機能もほとんど入ってます。それでいてRaycast自身はほぼ全てが無料で使えるのが強いです。

Raycastデフォルトの機能はめちゃめちゃ多いというわけではないですが（感覚次第）、別途コミュニティベースの **[ストア](https://www.raycast.com/store)によって拡張が可能** です。

正直デフォルトで入って良い気もする[ブラウザのブックマークランチャー](https://www.raycast.com/raycast/browser-bookmarks)とかタスク整理ツール[Asana](https://www.raycast.com/raycast/asana)とか[Jira](https://www.raycast.com/raycast/jira)とかをインストールすることでブックマークから開いたり、AsanaやJiraのタスクを作成することが出来たり。

ただ、デフォルトで入っているツールもかなり強力なものが多く、[最高ポイント](#最高ポイント（の一部）)で紹介していこうと思います。

# 最高ポイント（の一部）

Raycast自身は現時点で、個人で使う場合には無料です[^price]。ですが、Alfredの有料版と負けず劣らずの機能がデフォルトで付いてきます。加えて、Alfredでは出来ないようなことも出来てしまいます。

[^price]: ちょっと前に見たときはなかった気がしますが、チーム間で共有のクイックリンクや共有のスニペットなどを使えるチームというのがどうやら登場するらしいです（[価格設定](https://www.raycast.com/pricing))。

## カレンダーが見れる / Web会議にEnterキー一つで参加できる

上記の記事にも記載がありますが、本当に神機能と言ってもいいです。これだけで乗り換えてもいいぐらい。

おそらくAlfredでは（多分）出来ない機能かなぁと思います。詳しく調べてないですが。

おそらくMacのスケジュールを見ているので、例えばGoogleカレンダーを使っている場合は、GoogleカレンダーとMacのスケジュールを連携する必要があると思います。[Google カレンダーの予定を Apple カレンダーに追加する - パソコン - カレンダー ヘルプ](https://support.google.com/calendar/answer/99358?hl=JA)とかが参考になると思います。

![Raycastのスケジュール表示](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Raycast%20Schedule.png)

いい感じのイベントが無かったのでZoomのない適当な予定を作ってしましましたが、直近5分のイベントが自動的に表示されます。もしこれがZoomやGoogle Meet、おそらく他のWeb会議リンクなどが載っていれば**Enterを押すだけで会議に参加できてしまいます**。

個人で使う分には会議などの参加が少なくメリットはないかもしれませんが、仕事で使う分にはメチャメチャお仕事エクスペリエンスが良くなります。
以前の僕はAlfredを開いて`gcal`と入力してGoogleカレンダーを開いて、直近の予定をクリックしてZoomに入っていたのですが、それがなくなりました。それだけなんですが、なんかメチャメチャ快適になりました。

## クリップボード管理

Windows10では`Win + v`でいつの間にか使えるようになったクリップボード管理。macだと外部ツールを使う必要があります。特にAlfred単体でクリップボード管理を行おうとすると、有料のPowerpackを購入する必要があります。

ですが、Raycastは**デフォルトで**その機能があります。Raycastを開いて`Cmd + ,`で設定を開いて、Extensionsを見るとどんな機能があるのか見れますが、`clip`とかで検索すると出てきます。

ただ、デフォルトだとショートカットが設定されていないので、Raycastを開いてから`clip`とか打たないと出てきません。Raycastの最高ポイントの一つとしては、**すべての機能にHotKeyを使える**ことです。僕の場合は下記のように`Cmd + Opt + C`でクリップボードの履歴が出るようになっています。Alfredの名残ですね。

![Raycastのクリップボード](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Raycast%20Clip.png)

## ウィンドウ管理

僕がAlfredで利用していた機能の一つとしてウィンドウ管理があります。これまたAlfredの有料機能PowerPackにて使えるWorkflowを使った拡張の一つの[Div](https://github.com/pawelgrzybek/div)を利用することで可能です。
Macには他のウィンドウ管理ツールがあるので、無理にこだわることはないですが、特に理由もなくDivも使っていました。

Raycastにはまたまた**デフォルトで**ウィンドウ管理機能があります。

設定を開いて、`Window Management`で検索すると出てきます。
僕の場合、基本的には下に半分、上に半分、左に半分、右に半分のみしか使わないので、そこにしかショートカットを振っていませんが（これもAlfred - Divの名残です）、メチャメチャ細かくウィンドウ管理が出来るので、Raycast単体で結構細かいことができるようになります。

![RaycastのWindow管理](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Raycast%20Window%20management.png)

DivはWorkflowの機能を使っているからだとは思いますが、RaycastはDivより圧倒的にレスポンスが良いので、地味に嬉しいポイントの一つです。Divは動いたのか動いてないのか一瞬分かりづらいので。

## 完全キーボード操作可能

僕自身は多分他人に比べて異常なぐらいマウス(トラックパッド)を使うユーザーなので、キーボード操作に対する強い渇望はないですが、Vimが好きな人は多分好きだと思います。あ、ただ、hjklで移動できないので、そうでもないかも。Emacs好きなら良いと思います。

キーボードから手を離したくないって人はメチャメチャ良いかもしれないです。設定すら全部キーボード操作可能です。どのボタン押せばいいか分かりづらいですが（もしかしたらAlfredもそうかも？ 知らないです）。

# Alfredから乗り換える

RaycastもAlfredもメチャメチャ満足度の高いツールなので、どちらを使うかは人によると思います。とりわけAlfredをメチャメチャ使ってた人は乗り換えるのが結構難しいかもしれませんし、心理的にも今まで使っていたツールから離れるのは厳しいかもしれないです。

とりわけPowerPackを購入していた場合は、完全にAlfredの上位互換というわけではないので乗り換えできない機能もありますが、ある程度Raycastでも代替可能なのでいくつか紹介します。仮に無料版だとほぼほぼAlfredでもできる機能　+ アルファなツールだと思います。

## 動作関連

まずRaycastのデフォルトの動作は、ちょっとAlfredと違います。
例えばマルチスクリーン環境だとAlfredは必ずプライマリスクリーンに表示されます（一応設定で変更可能[^screen-config]）が、Raycastでは今カーソルがあるスクリーンに表示されます。それのほうが良い気がしますが、Alfredに慣れきってしまっているので、ショートカットを押した瞬間プライマリスクリーンを見てしまう癖がついています。

[^screen-config]: この記事を書くために調べて初めて知りましたが、初見でこれを見つけられる気がしないところに設定がありました。Alfredで設定したい場合は[Alfredを複数ディスプレイで使うときに表示するスクリーンを選ぶ方法 | Rriver](https://parashuto.com/rriver/tools/alfred-on-multiple-displays)とかを参考にやってみてください。

また、Raycastでなにか動作をしたあと、すぐに開くと以前のコマンドが残っています。すぐに開くことはめったにないのですが、個人的にはチョット気になりました。Alfredでは以前のコマンドを残すような設定は出来なさそう？ ですが、個人的にはその動作で構わないです。

そのあたりの設定も設定できます。さすが。

![Raycast Advance Setting](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Raycast%20Advance%20Setting.png)

例えば`Show Raycast on`の項目は、ショートカットを押したときの表示位置です。

- マウスのあるスクリーン
- アクティブウィンドウのあるスクリーン
- プライマリスクリーン

の中から選べます。一応Alfredと同じ。

`Pop to Root Search`は以前のコマンドをリセットするまでの時間です。デフォルトだと5秒とかだったような記憶なので、思いがけず発生することはないと思いますが、一応個人的に`Immediately`を選択しています。

`Auto-switch Input source`も`ABC`のほうが良い気がします。これもAlfredで設定できますね。あんまり気にしたことがなかったので、デフォルトでも良いかもしれません。

あくまで、このあたりは個人の好みですね。

## フォールバック時の動作

AlfredもRaycastもコマンドが存在しない場合のデフォルトの挙動というのがあります。Alfredの場合はgoogle検索・Amazonでの検索・Wikipediaの検索です（多分）。

何故か**PowerPackユーザーのみしか**Alfredはデフォルトの挙動を変えられませんが、一応変えられます。

Raycastも当然のように変えられます。若干分かりづらいですが。

Raycastを開いて、普通にコマンドで`fallback`とか打つと`Manage Fallback Commands`というのが出てきます。それをEnterで起動すると、下記の様な画面になります。

![Raycastのフォールバック管理](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Raycast%E3%81%AE%E3%83%95%E3%82%A9%E3%83%BC%E3%83%AB%E3%83%90%E3%83%83%E3%82%AF%E7%AE%A1%E7%90%86.png)

デフォルトだとFile Searchが上にあるのですが、正直デフォルトはGoogle検索が欲しいです。なので、いじってみます。パット見ると順番をいじれなさそうですが`Cmd + Alt + ↓↑`で順番を入れ替えられます。EnterキーでEnableとDisableを切り替えられるので、好きなコマンドをfallback時の動作に割り当てられます。

## Quick Link

Raycastがデフォルトで出来ずにAlfredでできることは、例えばブラウザのブックマークをデフォルトで開けるかことです。

例えば僕はブックマークに`GCP`があります。AlfredはPowerPackがなくても`GCP`と打ち込めば勝手にブックマークにあるGCPのURLをブラウザで開いてくれます。

一応Raycastにも、上記に記載した[ブラウザのブックマークランチャー](https://www.raycast.com/raycast/browser-bookmarks)がありますが、これは一回ブラウザのブックマークランチャーコマンド(例えば`bookmark`)を打ってから`GCP`と打たないと出てきません。

ですが、Raycastには`Quick Links`という、Alfredでいう`Web Search`みたいな機能があります。

設定画面から右上の+ボタンを押下して、`Create QuickLink`を押下すると色々設定できます。

例えば、GCPのdev環境とprod環境を追加してみたり。

各コマンドにはショートカット以外にも`Alias`を設定できます。6文字と激短い(なので`gcpprod`が入らない)ですが、よく使うコマンドにはAliasを振っておくとメチャメチャはかどります。なので、この設定の場合は`gcp`と打つと何よりも先にGCPのdev環境が開いて、`gcpp`ぐらいまで打つとGCPの本番環境が開きます（もちろん文字を打っただけでは開かないです。Enterを押してください。一応）。

![Raycast Quick Links](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Raycast%20Quiklinks.png)
もちろんQueryも設定できるので、何かの検索なども可能です。

AlfredでBookmarkの中にあるものをコマンド経由でメチャメチャ開いていた人はいちいちQuickLinkを追加しなければ行けないのが大変ですが、一応代替機能にはなるので、できなくなるということは有りません。

## 　簡単なスクリプト

Alfred PowerPackの大きな特徴はやはりWorkflowでしょう。他人の拡張機能のインストールが面倒くさいのはありますが、自分で色々やる分には結構便利です。僕自身はそこまで使っているわけでは有りませんでしたが、Raycastで使えなくなったものは有りました。

Raycast自身も自分で拡張することは出来ますが、方法の1つはReactを用いて拡張を作ることです（ https://developers.raycast.com/ ）。
私自身はReactなんだ、やったぜ、という感じですがWorkflowほど万人が使えるものでもなければ、Workflowほど簡単に強力なものは作れないかもしれません（試してないのでなんとも言えないです）。

ですが、もう一つ、簡単なスクリプトもかけます。

- Bash
- AppleScript
- Swift(!)
- Python
- Ruby
- Node.js

上記のスクリプトを書くことが出来ます。これ自身もWorkflowほどの強力なものは使えないし、結局プログラムを書けないと出来ないのですが、それでもReactでRaycastの拡張を書くよりは楽です。結局Workflowもスクリプトに頼りがちでしたし。

例えば、僕がWorkflowから持ってきたのは、下記のスクリプトです。

```bash:mov2gif.sh
#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Mov to Gif
# @raycast.mode compact

# Optional parameters: 
# @raycast.icon 🤖
# @raycast.argument1 { "type": "text", "placeholder": "mov file" }
# Documentation:
# @raycast.author sa2taka
# @raycast.authorURL https://github.com/sa2taka

query=$1

echo $query
/usr/local/bin/ffmpeg -i /Users/sa2taka/Desktop/$query.mov -r 24 /Users/sa2taka/Desktop/$query.gif

```

上記は指定した引数のデスクトップにあるmovファイルを、gifに変換するスクリプトです。
GithubのPRのコメントを書く際にMovだと再生ボタンを押さないといけないといけなくなるので、特に理由もなくGif化います。そのときに使ってます。

追加手順は`https://github.com/raycast/script-commands`のReadmeを参照ください。

AlfredのWorkflowが強力だったのはこのファイル名を、「デスクトップにあるmovを選択する」みたいに制約をかけることでした。
いま現状、そういったものはRaycastのこのスクリプトだと`@raycast.argument1`とかの`type`とかで指定できるものだと思いますが、残念ながら`text`しか選択できません。今後、`file`とか選択できる様になるんだと思います。期待。

## Alfredで使ってた拡張

僕自身、Alfredのヘビーユーザーではないというのはすでに記載しているところですので参考にならないかもしれませんが、だいたいAlfredの有名なWorkflowの機能はあると思います。

例えばウィンドウ管理のdivは上記に記載したとおりデフォルトであります。

あくまで僕が使っていたものですが、一例として下記に記載します。

- githubの検索
   - Workflow: https://github.com/gharlan/alfred-github-workflow
   - Raycast: https://www.raycast.com/raycast/github
       - の Search Repositories
- Emoji検索
    - Workflow: https://github.com/jsumners/alfred-emoji
    - Raycast: https://www.raycast.com/FezVrasta/emoji
- VS Codeを開く
    - Workflow: https://github.com/franzheidl/alfred-workflows/tree/master/open-with-visual-studio-code
        - 正直ファイルを開きたい気持ちは全く無いのにファイル候補にファイルも出てきて、フォルダを開こうと思ってファイルを開いちゃったみたいな事象が多かったので、不満は高かった。ので、乗り換えてよかった。
    - Raycast: https://www.raycast.com/MarkusLanger/vscode-project-manager
        - 上記は、Project ManagerというExtensionが必須。ただ、入れると便利だったので、入れた
        - または https://www.raycast.com/thomas/visual-studio-code

- サウンドの環境設定（入出力デバイスの変更）
    - Workflow: https://www.packal.org/workflow/audio-switch
    - Raycast: デフォルトでできる(!)
    - 最近は出社してないですが、オフィスではAirpods、家ではディスプレイ（から伸びてるヘッドフォン）、リモート会議中はMacgookと出力デバイスを切り替えています。
    - WorkflowもRaycastも読み込み時間が若干かかるので、あんまり使ってない機能ではあります。ただAlfredで`input`と打つと、サジェストにGoogle入力のアンインストールが現れるのが面倒くさかった記憶だけは強いです。

他にも、リマインダーとかはデフォルトでありますし、Empty Trushとかそういったシステム的な機能もデフォルトであります。Jiraとか著名（で開発者が使ってそう）なツール系も豊富にあるので、オレオレWorkflowをふんだんに使っていない限り乗り換えは難しくなさそうだなぁと。（TrelloはRaycastになくてWorkflowにありそうっすね。）

# まとめ

Raycastのスケジュール機能は本当に便利です。最高。[Meeting Bar](https://apps.apple.com/jp/app/meetingbar/id1532419400?mt=12)というのも教えてもらい、これを含めてスケジュールに敵なしという感じ。

他にもAlfredでできるけど、Raycastで出来ないみたいな機能はあんまりないので、Workflowをメチャメチャ使ってます、というわけでも無ければ上記を参考にちょっとだけ浮気してみてみましょう。
