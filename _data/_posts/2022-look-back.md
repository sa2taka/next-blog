---
layout:      post
title:       2022年を振り返る
category:    look-back
author:      sa2taka
tags:        
public:      true
createdAt:   2022-12-31
updatedAt:   2022-12-31
latex:       false
description:
  2022年を振り返る需要のない記事。TypeScriptで何をやったか、おすすめの本について、自作キーボードについてを記載。  
---

ハローワールド

[2021年に使った技術の振り返り](https://blog.sa2taka.com/post/2021-look-back-tech/)からもう一年。あっと言う間の一年でした。

2021年は転職という最大のイベントが有り、そこから色々変化しました。そんな物理的な変化の年が2021年だとしたなら、2022年は精神的な変化、そして成長の年だったかもしれません。

ただ、2022年は、特に自ら積極的に触りに行った技術は、振り返るとあんまりありませんでした。RustやGolangなどは触りたかった(し、Rustに関してはそこそこ書いた)のですが、TypeScriptやRubyほどにまだまだ仲良く慣れたわけではありません。

また、仕事に関する延長線で様々触り、趣味で何かを作るということが余りませんでした。

# TypeScript

本年も変わらず、仕事の99.8%はTypeScriptとにらめっこしていました。一年間本気で書き続けて、一年前のコードを眺めて、成長したなぁと感じます。

また、TypeScriptだけではなく、その周りのエコシステムにも色々手を触れました。

## ESLint

ESLintのカスタムルールを作成していました(正確には去年の暮れに触っていましたが)。

TypeScriptはASTなどを利用したパターンが多く、ドキュメントも豊富なのでそういった込み入った部分の難しさはなく、ロジック的に難しい処理も簡単に書けるのが良いです。
[JavaScriptのArray#Reduceの関数内で第二引数の変数を利用した場合エラーになるESLintのルール](https://blog.sa2taka.com/post/javascript-array-reduce-no-invalid-variable-eslint/)はそこそこのロジックが必要ですが、それでも数時間で書けるようなものです。

ESLintなどのエコシステムの強力さが前提ですが、こういうの困るなぁというものを解決できるようになっていくのは素直に楽しいですね。

## VSCode Extension

TypeScriptに直接関係ないですが、VSCodeの拡張も書いていました。
VSCodeの拡張はTypeScriptで書いていますし、作成した拡張２つ、[JS Teleporter](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-teleporter)と[JS Test Outline](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-test-outline)はどちらもJavaScript/TypeScript用のものです。

特に前者のJS Teleporterは本当にこれが無いと個人的にはプログラムが書けないほど愛用しています。自画自賛。

# 良かった本

2022年はTypeScript一辺倒であり、正直もうRubyすらほぼ書けないぐらいにはなってきています。今年は(も)このブログで大したアウトプットはしていませんが、その理由の一つはだいたい仕事に関連するものしかやってないからでしょうか。今年の記事は、ほとんど仕事の延長線上の話だったりしますしね。

しかしながら、インプットの時間は比較的多くとっています。特に今年私は初めてメンターになり、苦手な部分をどうに関して頑張らなければならない状態でした。そのためエンジニアに近しい、しかしながらちょっと外側のマネジメントや考え方などの自己啓発本を多く読んでいました。

今年読んだ本でいくつか良かったものを紹介します。

## 失敗の科学

[失敗の科学 失敗から学習する組織、学習できない組織](https://www.amazon.co.jp/dp/4799320238)は個人的には全宇宙人が読むべき本、と思うぐらいには良かったです。私自身の考えた方が近しいから、というのもありますが非常に良い本でした。

失敗から学ぶ航空会社と、失敗から学習できない医療学会という2つの側面から、失敗との付き合い方や考え方などを書いている本です。

エンジニアの世界はインシデントレスポンスやポストモーテム、最近ではプレモーテムという言葉もあるほど、失敗との付き合い方は比較的上手いと思います。
ただ、個人を見ると当然千差万別で、私は「失敗からしか人間は学べない」とよくいってますが、私だって失敗なんてしたくありませんし、失敗を隠したくもなります。
この本を読めば、松岡修造のように「失敗したときこそ、ガッツポーズだ」……とまではいか無いかもしれませんが、失敗へ向き合い、成長できるようになるマインドを持つことが出来ると思います。

## エッセンシャル思考

失敗の科学は失敗に対する考え方を変えるのであれば、[エッセンシャル思考 最少の時間で成果を最大にする](https://www.amazon.co.jp/dp/4761270438)は日常の仕事に関する考え方変えます。

すごーく雑なまとめとしては、重要なことを見極め、YESとNOをきっちりと判断し、最大の成果を上げることに関して説かれています。
比較的マネージャークラスに最も突き刺さる話かもしれませんが、十分考え方としては読みごたえのあるものでした。

エンジニア、とくにSaaSのようなサービスでは、何が必要か、何が必要じゃないかの判断が重要です。基本的に機能の必要性はいわゆるドメインエキスパート、プロダクトマネージャーやプロジェクトマネージャーが決めます。エンジニアとしても「この機能は改善したほうが良い」なども当然あります。もちろんそれぞれの立場を吟味し、最も良い機能をプロジェクトマネージャーなどが優先順位を決めますが、エンジニアとしてもどの機能が重要なのか、そしてなぜ重要なのかを説明する権利と義務と責任があります。

この意外に見落としがちな「今最も重要なものはなにか」という点の重要さを確認でき、どうすればよいのかを与えてくれる本です。

この本の影響下はわかりませんが、精神的な成長は感じています。「本当に必要なものはなにか」「どれを行うのが最も良いのか」そういった考えを持って仕事に取り組むことが出来ています。

## プリンシプルオブプログラミング

[プリンシプル オブ プログラミング3年目までに身につけたい一生役立つ101の原理原則](https://www.amazon.co.jp/gp/product/4798046140)は、読んで良かった、というよりかは、色々まとまっててよかったという本ですね。

私自身はもう社会に出てエンジニアとして4年過ごしていますが、だいたい上記に記載している原理原則はほぼ知っていました。ちなみに最も好きな原則はSLAP、抽象度統一の原則です。

原理原則というのは正直知らなくても書けますが、こういった原理原則はいわばマナーみたいなもので、知っておくと良い場合もあります。
タイトルの通り「三年目までには身につけたい」知識だなぁと思いました。この本読まくても僕みたいに身につく可能性はありますが、最短ルートで知れるのはいいと思いました。

また、こういうのは改めて読むと再発見があるので、例えばここリファクタリングしたいなぁ、とリファクタリングの帽子[^refactoring]をかぶって実際にリファクタリングを行う前に、この本を読むことで意外な気づきがあるかもしれません。

[^refactoring]: [リファクタリング](https://www.amazon.co.jp/dp/4274224546)でKent Beckが記載している、コードを書くときとは違う視点や考え方を持ちなさい、新規機能の追加の実装ではなくコードの修正に集中しなさい、という比喩のこと

## ソフトウェアアーキテクチャの基礎

[ソフトウェアアーキテクチャの基礎 - エンジニアリングに基づく体系的アプローチ](https://www.oreilly.co.jp/books/9784873119823/)は文字通りソフトウェアアーキテクチャの基礎についての本です。

もちろんモノリスやレイヤード、マイクロサービスアーキテクチャなどの様々なアーキテクチャの特徴、アーキテクチャの特性や適応度関数など、知識としてもっておきたいものがまとまっており、一回読んで終わりではなく、定期的に読み返したいものとなっています。アーキテクトじゃなくても凄く参考になるので(私も別にアーキテクトなんて素晴らしい肩書は持てそうもありませんし)読むと良いと思います。

# キーボード

を自作しました。

**基盤から**

![自作キーボードの基盤](https://images.ctfassets.net/xw0ljpdch9v4/4OArQNGFqJMknFOEkAcQMP/4fa74a3ac1b217c92a9e516defcdd7f4/image.png)

ブログの記事にしたかったんですが、面倒だったので書いていません。ただ、完全に基盤から自作している記事は思ったより少なかったので、供給に対する需要は少なからずあるかもしれません。

自作キーボードはあんまり興味無かったのですが、どうしてもオレオレ配置でキーボードを作りたくて自作しました。

現在もですが、元々ErgoDox使っており、キーの数が多くて大きすぎる以外は不満ないのですが、大きすぎるので持ち運びに不便すぎるというのが一点。あとはカフェとかでドヤ顔で尊師スタイル[^sonshi-style]をしたかったのが一点。そのためHHKBがほしかったのですが、私ErgoDoxの右手の親指をBackSpaceにしており、まぁもう癖が付いてしまいまして。普通のMacbookのキーボードを時折使うと、10分ぐらいは削除しようとスペースキーを連打することになっていまいます。

[^sonshi-style]: 尊師ことリチャード・ストールマンのキーボードの配置方法。ノートPCの上にキーボードを置く

そのため、スペースキーを左手側と右手側で分割したかった。
また、正直作ってから不要な気もしましたが、十字キーも割とほしかった。ただ、十字キーがあると大体JIS規格のキーボードになっており、ErgoDoxがほぼなんちゃってUS規格(ANSI規格)なので、そこでも合わない

そうなると、自分で配置から自作するしかない、と考えました。

結果的に下記のような配列に落ち着いています。

http://www.keyboard-layout-editor.com/#/gists/af023180a5084944c7839b35cc7a3d5d

キースイッチは[Input Club Hako スイッチ](https://shop.yushakobo.jp/products/input-club-hako-switches)のViolet。個人的にはタクタイル以外あんまり触ったことないですが、やはりタクタイルが好きかなぁと思います。ただ、上記のタクタイルスイッチが良すぎて、ちょっとErgoDoxのスイッチが物足りなく感じます。

キーボードは基盤を上下からプレートで挟んでいますが、プレートはアルミ製。スペインで生成してもらって、一番金がかかってます。よかった、失敗しなくて。また、どうせなら色もこだわりたく(そして一度スイッチをハンダ付けしたらトッププレートは永遠に取れないので)、黒く塗りました。

また、キーキャップは、AliExpressで無刻印のキーキャップを選びました。キーキャップを届いて、全部作業台にぶちまけたあと、無刻印であることを思い出し泣きました。キーキャップは列ごとに高さが違うので。

結果的に下記の用になりました。無骨な感じで、プロフェッショナルキーボード感があります。
ちなみに、側面は真っ黒のマスキングテープを貼ってます。数百円でした。

![自作キーボードの俯瞰図](https://images.ctfassets.net/xw0ljpdch9v4/cwTGatN91U35O1SR39ThN/257ce6b04cdf43923117df510480bb8d/image.png)

作成するにあたり下記のサイト・本にお世話になりました。この場でお礼申し上げます。

- [AK62 (60% Apple Keyboard M0116) / LOG](https://log.brdr.jp/post/532)
    - キーボードづくりの90%をこの記事を参考にしています。これがなければ多分作れてなかったと思います
- [自作キーボード設計入門(電子版) - Pastry Keyboard - BOOTH](https://booth.pm/ja/items/1044084)
    - 自作キーボードを作る上の基礎知識が全部載ってます
- [On The Phosphor Bronze: 自作キーボード沼に入ってみた件②](https://phosphor-bronze.blogspot.com/2019/04/blog-post_15.html)
    - キーボードのケース(?)塗装したのですが、塗装の方法を参考にさせていただきました

# 料理

なんか最近料理をめっちゃ作ってます。

[Kurashiru](https://www.youtube.com/channel/UCE40kwov-UdhGikwAowjAAQ)さんのYoutubeチャンネルがたまたま流れてきてて、簡単に作れそうだったので作って、そして一度見たのでまたおすすめに別の動画が流れて、簡単に作れそうだったので作って、というのを3回ぐらい繰り返したら、ここ二週間ぐらいは外食すらしなくなりました。ただ、多分外食より不健康な量は食っている気もします。
以前も料理はそこそこの頻度で作っていましたが、以前と比べてキャベツの千切りの細かさと速度が格段に上がりました。

# 2023年

目下やりたいことが一つあり、それはTypeScriptでSAMLのIdPの実装です。
別に僕がやる必要は一切ないのですが、弊チームの認証基盤が刷新するに当たり、色々な理由でSSOとしてSAMLが実装されるらしいので、SAMLの勉強をするつもりです。

2022年はRustを書きたいとずっといってましたが、正直作りたいものが思いつかなかったので書かなかったです。Zigとかも気になるし...でも作りたいものないし...ということで思いついたら作ります。思いつかなかったら今年と同じです。

また、2年前にTypeScriptでMITMプロキシを作成し、それを元になんか簡易版BurpSuitみたいなものを作成しようとして、リポジトリだけ存在していますが、正直飽きている状態なのをどうにかしたいです(https://github.com/sa2taka/Vuloon)。

あとは、仕事ですね。ひたすら経験を積み、設計力を上げていきたいと思います。あと、メンター業。