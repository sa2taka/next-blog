---
layout:      post
title:       コードレビューのやり方を決める
category:    criteria
author:      sa2taka
tags:        review
public:      true
createdAt:   2024-05-06
updatedAt:   2024-05-06
latex:       false
description:
   自分なりのレビューの書き方を晒すというよりは、どちらかというと今後の自分の基準を決めるための備忘録。
---

本記事はよりよいコードレビューのやり方を記載するというよりは、自分なりに今後のコードレビューを豊かにするためにやりかたを考えていく備忘録である。
というのも、私自身コードレビューをするようになって数年経ったが、あまり明確なやりかたとかを定めていない現状があり、打開していきたいなと思ったため。とりあえずドキュメントがあれば1つ基準ができ将来に渡って改善できることを期待する。

コードレビューというのは会社やチームの文化、利用している言語・ツール、システムの特性などにより大きく変わるものだと思う。

とりあえず前提としては、Githubなどを利用してPR単位でCIが実行され説明が付与されレビューする環境を考えている。


# 目的

コードレビューの目的は、一番は**知識の共有**だと考えている。
単純にレビューすることで、レビュワーは対象のコードが追加、または削除されることを知る・対象の変更の理由がわかる・対象の機能が必要とされる理由がわかる。
私自身はチームメンバーの中で在籍期間だけで言えばかなり長い方であり、様々な機能とその仕様・歴史的経緯・インシデントを知っている。また言語も長く扱っているため、よりよい書き方なども提示できるケースもあるだろう。レビューされる側に対しても、その知見からアドバイス可能となる。
これに関してはコードレビュー以外の機会でも知れるべきだと思うが、コードレビューだと具体的なコードとして知ることができるのが利点。

メタ的な観点だが、コードレビューに高いコストを掛けてしまうと、レビューする気力もなくなる。**レビューのコストは少ないほうが良い**。多大なコストをかければバグを潰せるかもしれないが、レビュワーである我々はただの1つのザルに過ぎないため、指摘できる項目は時間とともに減り、どれだけ時間をかけて指摘ができないケースも有る。であればコスパを取っていきたい。
ただ、その評価軸だけであれば何もせずにApproveするマンが生まれるので、最低限のパフォーマンスとして**可能な限り複雑性の低い・メンテナンス性の高いコードであることを維持する**・**致命的なバグを回避する**ことも評価軸に取り込みたい。


まとめると

- 知識の共有をする
    - 自身も管理するシステムにどのような機能が具体的にどんなコードで記載されているかを把握する
    - 特に自身がシニアだったり在籍期間がながければ、レビューとして知見を共有する
- 第三者の目で複雑性・メンテナンス性を評価する
- 致命的なバグを回避する
- （メタ的な視点で）コードレビューのコストは低く

# やり方

レビューのやり方として重要度順に記載していく。◎と◯は基本的に行い、指摘事項がある場合は大体の場合変更を依頼または推奨する。△と✗は大抵の場合行わず、指摘したとしても修正の必要は薄くしている。

- ◎は大抵すべてのPRに対して必ず行う
- ◯もすべてのPRに対して行う。◎ほど重要視はしていないが重視する点
- △は基本行わない。特定のケースの場合行う
- ✗印は基本は指摘しない
 

## ◎どこにどのような変更があるのかをインプットする・インプット可能な状態であるかを確認する

これは目的と直結する話。短期的な目線としてはレビューするためにインプットをするというのもあるし、長期的にそういった変更があるんだなという、システムに対する理解のためのインプットでもある。また「この書き方良いな」とか、そういったものもインプットできる機会である。レビュワーにならなくても『読む』機会は作れるだろうが、やはりレビュワーにならないと『読まなければならない』機会は作りづらいだろう。

一方でレビュワーはチーム全体の代表者という考え方をしている。現在のチームにおいては在籍期間が長いためPRの説明が薄くても変更理由はわかるが、新しく入ってきた人やコンテキストが薄くなってきた1年後・2年後にPRを確認する際は説明文が薄いととても困る。**PR（とリンク先の情報）だけで完結しているかというのもチーム代表として確認しておきたい**。

## ◎影響範囲を考える・コードを書いた人が想定していないような問題が発生しないかを考える

これも目的である「致命的なバグを回避する」と直結する。

チームの文化やシステムの特性の関係も少なくないと思うが、経験上レビュー段階で仕様の抜け漏れが発生することは少ない。一方対象の変更が別の変更に影響を与える・対象の前の処理が対象の変更の前提条件とことなるなどにより問題が発生するといった、**影響範囲・依存関係の把握不足**が目立つ。正直これは単体テストでは確認しづらい・E2Eではそのようなエッジケースを記載するにはコストが高い・実際の環境で確認しても条件が複合している場合などに発生しないケースもあるなど、発見するのは難しく特に新規メンバーの場合は気づくほうが難しいだろう。上記の知見の共有ではないが、レビューで発見できれば嬉しいと思っている。

こちらはどちらかというとシニアな人やチームの在籍期間が長い人向けの視点だと思う。一方でジュニアメンバーやジョインしてから日が浅い人も、特に影響範囲の観点は時間をかけて行ってもいいだろう。コスト、特に時間と集中力はかかるが、対象のコードが具体的にどこで呼び出されているか・対象のコードで変更しDBへ保存される値はどこで参照されるのだろうか、という観点を確認すればシステムの解像度も上がる。

## ◯仕様と異なる実装がないか・仕様を満たすことを確認できるような確認方法がされているかを見る

「致命的なバグを回避する」につながる。

これが◎ではない理由だが、影響範囲を確認した結果、ごく僅かな部分でしか利用されていないケースは多々ある。多少バグが有ってもお客様に迷惑はかけないだろう部分。そういったコードは知識・経験的に知っているため、多大な時間をかけてみることはしていないため◎からは外した。

「仕様と異なる実装がないか」と記載しているが、このときの仕様はPRに記載されているものではなく、より**原本に近いもの**。例えば紐づくIssueやそれを決めたときの議事録やSlack、仕様をまとめたドキュメントが望ましい。というのも書いた人間が仕様を曲解している可能性もあるからだ。ただこれもコストがかかる作業なので、重要度を見極めてもいいだろう。個人的には普段からそういった仕様決めには関係なくても顔を出してざっくりとだが把握することが多く、その手を使うのもありだ。

また、個人的にはやりたいができていない部分として、**動作確認の方法についてもレビューに含めたい**。今後見るぞ、という意思表示。
仕様を満たすようなコードを書いているつもりでも、動作させてみると全然動かなかったり、エッジケースのテストがなくて実際には仕様を正しく反映できていなかった、というケースがある。
[読みやすいテストコードのために心がけること ver 2024.](https://blog.sa2taka.com/post/readable-test-code-2024/)で記載しているように、私自身の思想としてはテストは仕様であるというものだが、他人に対して押し付ける気はないため厳密にテストケースが仕様に沿っているかは見ない。が、テストケースが一定仕様を満たしているかは確認する。
また単体テストではなかなか確認できない手やテストを書きづらい部分に関しては実際の環境での動作確認でどういった方法で確認したかなどを確認していきたい（PRテンプレートに確認方法を記載する欄があるため、そういった実際の環境での動作検証方法は記載がある）。

## ◯関数の追加・変更された場合、インターフェースの妥当性を見る

「第三者の目で複雑性・メンテナンス性を評価する」に直結する。個人的な思想が十分に入り込んでいる項目。

実装が複雑だったとしても読みづらいだけで、時間をかければ読み解けるし、最悪リファクタリングは可能であるため、相当壊滅的でない限り指摘することは少ない。指摘したとしても、あくまで代替案であり、そのままでも良いというスタンス。

一方で、インターフェースの複雑度はリファクタリングの難易度を上げる。インターフェースで渡ってくる値が多ければ大きいほど複雑性は増すし、大抵の場合多ければ多いほど実装も読みづらい。
可能な限り適切に処理を分割することでより適切なものがないかを考える。考えた結果妥当な複雑性である場合、そのままの場合もあれば、場合によっては仕様や設計を考えたりするケースもある。

## ◯外部影響の存在を確認する・外部影響の仕様を確認する・外部影響との接続による影響を確認する

「致命的なバグを回避する」に近い。「第三者の目で複雑性・メンテナンス性を評価する」も含む。

とりわけ単体テストでは外部システムに依存する処理は確認しづらい。システムによっては本番環境でしかまともに確認できないケースもあるだろう。

そういった外部影響というものがある場合は1つ注意を払う。
呼ぶときの作法は大丈夫か。APIの型は問題ないか。相手に渡す値は問題ないか。エラーケースやエラーハンドリングは問題ないか。
また、外部影響を含む処理が適切に分離されているかも確認したい。著名なライブラリでAPIクライアントのライブラリがある場合はその限りではないが、社内の他のシステムなどと（Node.jsでいえば）fetchのようなシンプルにHTTPクライアントを利用してやり取りする場合は、ちゃんとそこが分離されインターフェースでやり取りされているかを確認したい。大抵の場合、ここがきっちり分割できていないとコードがごちゃごちゃになる。

## ◯可読性を見る

個人的には△に近い◯。というのも、基本的にコードレビューしたら読みやすいか読みづらいかは判断がつくため。

ただし読みやすさというのは一定主観が強いのと、チームメンバーの全体的なレベル感も高いおかげで相当酷くない限りは読みづらいことはないし、読みづらい場合は仕様が複雑なケースが多い。
著しく読みづらい場合か、読みやすいために複雑性を下げるなどの代替案がコメントを残す。可能な限り代替案は提示する。

## ◯コピペされるコード（環境ごとの設定値など）に対してコピペミスが無いかを見る

これは個人的にめっちゃやらかす、という意味で記載している。「致命的なバグを回避する」に近いと思う。

複数環境ある場合、環境ごとに環境変数のみを変えたファイルを用意するケースは多いと思うが、この際本番環境の値と検証環境の値を同じにしてしまう、といったことが私自身よくやってしまう。
そのため、コピペっぽいなと思ったらその当たりを確認するようにしている。私のコードレビューしてくれる人はみんな気づいてくれるが、俺は確認も苦手で見逃したことがある。どうやっているのだろう。

とは言えど頻度としてはごく稀である。

## △実際に動かして動作を確認する

個人的にはリリースまでをコードを書いた人間が責任持ってほしいので、自分からローカルだったり検証環境だったりで動作を確認するケースはあまりない。やったほうが確実だが、私ぐらいズボラじゃなければ大抵コードを書いた人間はちゃんと動作確認しているし、確認するためにレビューコストも上がってしまう。確認したところで実装者と比べてもエッジケースを拾えるとは思えない。

一応フロントエンド側の変更の場合は触ることもある。自分の環境ではどう表示されるかとか手触り感のようなものは動作させるのが一番わかりやすい。私のシステムはそこまで気にするような華美なUIを持ち合わせていないので、頻度はかなり少ない。

## ✗仕様・設計に対して指摘する

チームの文化的な話でもあるし、一般的なプログラミング論でもあると思うが、コードを書いたあとに仕様を変えると手戻りが大きいため大体の場合はコードを書く前に仕様は決まる。小さい修正であればその限りではないが、大抵大きい場合は前段階で仕様をすり合わせるし、システム設計段階で設計をレビューする。

そのため仕様・設計自体の正しさは基本的には確認はしないが、下記2つの場合は例外としている。

- 仕様や設計がレビューされていない規模であり、筋の悪い仕様・設計の場合
     - 例えば何かを表示する機能であればこの画面で表示したほうが良いとか、特定の処理であればより適切な呼び出しタイミングだったりモデル構造だったりが存在する場合が該当する
     - コード作成者の経験不足から来ることがほとんどなので、知見の共有に近い話ではある
- 設計時に想定していなかったものがあり、成約を回避しようと実装が複雑になってしまう場合
     - 例えば、新しくAの処理を追加しようとしたが、これはBの処理を実行している前提だった。Bの処理前に追加する必要があるため、成約を回避するために事前にBの処理の一部を実行する、といったこと
     - そもそも設計で洗い出しておけという話ではあるが、気付いた段階でコード書く手を止めろという話でもある
     - 何らかの制約を回避するために色々処理を書くのは無駄だしバグの原因になるので、大きくなくてもそういった成約を回避するためだけのコードはアテンションを張るケースが多い。最適化を行っていきたい
     - 上記に記載した「インターフェースの妥当性」につながるが、設計が適切ではないためインターフェースが複雑になっている場合もある

## ✗コードの書き方を指摘する

新卒の方や言語の習熟度が低いような方ならともかく、基本行わない。LinterやFormatterで十分である。

一方で私自身は正直そこまで強く指摘しないが、やはり**意図が分かりづらい変数名などは指摘したほうが後々効いてくる**。英語的に無理があるとかは一定問題ないが（俺も得意じゃないし）、Arrayなのに単数形だったり`is〜`なのにbooleanじゃなかったりのようなものは型がわかる言語でさえ難読になるし、あまりにも実装と変数名が乖離していると読んでる側はパニックになる。この辺の変数名もいずれはAIがレビューしてくれるだろう。
