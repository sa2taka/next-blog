---
layout:      post
title:       他人が持つべき責任を自分が持たない
category:    poem
author:      sa2taka
tags:        
public:      true
createdAt:   2024-12-30
updatedAt:   2024-12-30
latex:       false
description:
   を、意識して生活してみる。そして、その仕組みを作れるなら作る。
---

エンジニア、とくに社内の非エンジニアと膝を突き合わせて仕事をする人は、どうしても相手の仕事を助けたくなる・エンジニアリングで解決したくなる。
本記事では非エンジニアと言っているが、アプリケーションを作成したりインフラを構築したりしない、主に運用している人だ。

社内のテックリードの方に言っていただいた言葉として「**自分が持つべき責任を他人に求めてはいけない**」という話があった。例えば私は基本的にはアプリケーションのバックエンドを書いたりするため、インフラはメインの業務ではない。しかし、アプリケーション起因でインフラ構成の変更があった場合に、そのインフラ構成の変更の責任はインフラチームにあるのか、ということだ。もちろん複雑なものであればインフラと一緒に進めるべきではあるだろうが、それでもインフラ「が」進めるものではない。加えて言えば、例えばCloud Storageのバケットを追加するとかIAMのロールを追加するとか、そういったものはterraformなり（手動なり）で自分でやれということだ。「**インフラの作業を待っているのでリリースできません**」というのは、自分が持つべき責任を他人に求めているのと同じである。

表面上の理解だと上記となる。たしかにその通りだ。しかし私自身はどちらかといえば（自分で言うのも憚られるが）親切な方で結構色んなところに頭を突っ込むタイプではあり、プロジェクトの障壁はチーム外とともに責任感をもって対応していたと思う。そのため、もちろん他人に責任を投げていたときもあったとも思うが、どちらかというと色々巻き取る側ではあった。

テックリードの方と話してみると、それだけではないことがわかった。
「自分が持つべき責任を他人に求めてはいけない」を主観で捉えると結論としては上記のようなものとなる。しかし客観で捉えるとどうか。自分以外の全員が「自分が持つべき責任を他人に求めてはいけない」というマインドを持つとどうなるか、という話である。つまりは「**他人もその人自身が持つべき責任をまた別の他人（自分）に求めてはいけない**」ということだ。

私自身は最初に記載したような非エンジニアと膝を突き合わせて仕事をするタイプの仕事に現在行っている。つまり自分の仕事の範疇は「エンジニアっぽい仕事」だ、と思っていた。

例えば、データ検証について考えてみる。非エンジニアの方から、こういうデータ欲しいから取得して欲しいと言われたとする。SQLを書いて、スプシかなんかに転記して、それを渡す。私がいつもやってきたことだ。
ただ、それも「自分が持つべき責任を他人に求めてはいけない」という話とリンクする。例えばそのデータが無いと仕事が進まない場合、（そしてデータの取得をすっかり忘れていた場合）責任の所在はデータ抽出をしているエンジニア側に移ってしまう。本来ならデータ抽出が必要なのは非エンジニア側の方だ。であれば、データ抽出も非エンジニア側の仕事である。
SQLを叩くことがエンジニアの仕事、というのが少し古い時代の考えだ。人によるだろうが、勉強さえすれば非エンジニアでも3か月もあれば私より自由にデータを抽出することも出来るだろう（私はウィンドウ関数を未だに空で書けない）。もちろん今すぐ欲しいということであればその勉強の時間の確保は難しいだろうが、いまではAI、LLMがある。エンジニア側がテーブル構造とテーブル・カラムの説明のER図（をMermaidかplantUMLで作成したもの）を渡してあげれば、それを使って自由にSQLを組むことができるはずだ。
SQL以外でもそうだ。Webエンジニアであるため、何でもかんでもNode.jsで解決したくなるが、アプリケーションと関係ない部分は非エンジニアに委譲できる形でも良いかもしれない。GASだったり、ノーコード・ローコードツールがうまく使えるかもしれない。

そうは言ってもデータというのはシステムの重要な要素であり、大抵の場合はAWSやGoogle Cloudの奥底の方にあるだろう。そのため、権限的にエンジニアしか触れられないというケースもあるかもしれない。
「なんでエンジニアしか触れないか」という発想でいくと「最小特権が...」となってしまう。いや非エンジニアが必要としているなら、その方々にもデータを閲覧できる権限はあるべきだろう。結局加工したデータは渡すのであるのだし。
逆転の発想で、「彼らにどうやって閲覧できるようにするか」を考えると、急に解決策は出てくる。BigQueryなりに吐き出してLooker Studioから見られるようにするとか、Cloud SQLに読み取りのみのユーザーを作ってGCEをプロキシにして接続するとか。

どうやっても無理な場合でも、相手が依頼しているなら、依頼の完了までを追うべきだろう。もしくはデリゲーションポーカーのような感じで、責任の所在を明確にするべきだろう。例がデータ抽出であるため、その程度でやる必要はないと思うが。

「自分が持つべき責任を他人に求めてはいけない」は、自分が持つべき責任を他人に求めないことだけではない。他人が持つべき責任を自分が持たないことも含まれる。相手が何かをやりたい時に、我々の手がかからず達成できる仕組みがあると良いだろう。