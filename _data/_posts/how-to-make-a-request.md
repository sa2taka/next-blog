---
layout:      post
title:       依頼のされ方から考える依頼のやり方
category:    criteria
author:      sa2taka
tags:        criteria
public:      true
createdAt:   2024-10-12
updatedAt:   2024-10-12
latex:       false
description:
   依頼をされる側から依頼をする側になりつつあるので、今日は依頼のやり方について考えてみた。
---

下っ端のエンジニアは依頼をするよりも依頼をされることのほうが多い。例えばプロジェクトリーダーから、例えば先輩エンジニアから、例えば隣の同期から、例えば営業の人から。
そんな私も社会人になって依頼を受けることが圧倒的に多かった。一方で歴が長くなっていくに連れ、依頼するということも多くなった。

本記事では**依頼された経験を活かし**て、**依頼の仕方の注意点を考えていく**。このやり方がベストというよりも、**まずは基準を作ってみて依頼をする際に眺め、誤っていたら定期的に正していくこと**、といったような目的の記事だ。

# 依頼される側から考える依頼者へのアドバイス

私自身は依頼を受けることはかなり得意な方だと思う。そう思う理由は「依頼をする側の足りない情報を勝手に補完する」力があるから、と感じている。
依頼の額面通りやる、そういったことは少ない。大抵の場合は依頼の文面そのままをやることが正しいわけではなく、依頼する側の本当の求めていることはなんなのか突き止める必要がある。ただ依頼する側はそれに必要な情報はたいてい提示しない。だからそれを補完している。

依頼される側のときは、もうちょい情報を提示してくれと感じていたが、一方で依頼する側に回るととたんにそういった情報を渡し忘れてしまう。これは依頼する側が悪いわけではなく、お互いの立場が変わることで情報の重要性が変わるためだと思う。

## 依頼例

私は現在ワークフローのシステムを作っているとする。経費申請や休暇申請などができるシステムだ。まだまだシステムは小さくデータ基盤が存在しないため、データの取得もエンジニアの仕事だ（本番環境でSELECT!）。

そこで対して仲良くもない同期からDMが来た。「申請の中から、2回以上申請が拒否されたワークフローを調べてくれない？」。
文言通りに受け取ってデータを投げて依頼を完了、とできるだろう。依頼自体は非常に明確だ（同期への依頼はたいていもっと適当だしね）。反射的に本番アクセス権限を上長に依頼してしまうかもしれない。

しかし私はそうは思わない。これは**最悪な依頼**だ。同期にエンジニアは俺しかいないからしょうがなく送ってきたのだろうが、もう少し情報を提供して欲しい、そう思う。
大抵の場合、これを文字通りやって依頼を投げるとあと3回ほど依頼を受け取ることになる。何故か。それは**依頼者の望みがわからないから**だ。

### 依頼の目的例、その1

例えば同期がいわゆるカスタマーサポートだったとしよう。担当の企業から「申請が間違っていることが多くてさ、たいてい2回ぐらい申請を拒否しているんだよね。多分申請をするときの画面が悪いんだと思うんだけどどうにかならない」などと言われたとしよう。顧客の生の声は貴重だ。これが続くと解約懸念にもなるし、逆にプロダクトの改善にもなる。
そこで同期はまずはその理由がどこにあるか調査することとした。まずはファクトを集めるために**対象企業の2回以上申請が拒否されたワークフローを集めるのが最適**と考え、**上記の依頼を送ってきた**。ただ、同期は忙しいんだろう。特に依頼文を精査することなく送ってきたみたいだ。

この場合は**何をアウトプットすべきかが最も足りていない**。例えば「その企業のみの現象なのか」「全体的にそういった傾向があるのか」、「特定のワークフローだけなのか」「全体的にそうなのか」、多分そういったファクトを渡すこととなる。別にあとからExcelで集計もできるだろうが、最初からそう言ってくれたらこっちがデータを渡すときにそういった情報を付与したり、何なら最初から集計して渡すことさえできる。この場合我々が出すべきものは「2回以上却下されたワークフローの企業とワークフローの種類」なんかが必要だろう。もっというと同期が会話した人の下についている人の申請だけがやたらと適当、という可能性さえあるため申請者情報なんかもあるといいかもしれない。

そういったものの把握のために様々な情報が必要なんだが、**その背景は依頼からわからない**。

### 依頼の目的例、その2

例えば同期がデザイナーだったとしよう。「ワークフローを2回以上却下することが多いよ。多分ワークフロー画面が悪いんだと思う」と様々な企業の人から言われている。流石にこれだけ再現のあるメッセージを受け取っていたら問題は明白なのだろう。そして同期が改善プロジェクトのデザイナーとして招集されることとなった。その同期にプロダクトの深い知識はないため、まずは問題となる画面を把握したくなった。ただ彼女もまた不明確な依頼の犠牲者なようで「2回の却下を撲滅せよプロジェクト」という名前しか知らないし、プロジェクトのメンバーは忙しく走り回っていて話ができそうもないらしい。手持ち無沙汰な同期は私のことを思い出し、とりあえずどんなワークフローの画面となっているか調査するために私に依頼を送ってきた。

この場合は**この場合は背景が最も足りていない**。私は「2回の却下を撲滅せよプロジェクト」のことなんて知らない。そうなると、とりあえず直近2週間の該当するワークフローのIDだけを返してみる。デザイナーとしてはワークフローのIDだけ渡されても困るのだ。ワークフローの画面を把握するためにはワークフローの種類やワークフローのテナント名などが必要だろう。ワークフローの種類を見ると、経費精算系っぽいもので多発していることがわかるなら、デザイナーとしてはその画面を確認するべきだ。もちろん、プロジェクト内でそういった情報を連携しておけよというのはごもっともである。
もっというと、そういった**課題があることを受け取れば**、**プロジェクトリーダーとの1on1などで展開できる**かもしれないし、**将来的にプロダクトの改修をするときにも背景知識として使える**。

そういったものの把握のために様々な情報が必要なんだが、**その背景は依頼からわからない**。

### 依頼の目的例、その3

例えば同期がテクニカルサポートだったとしよう。担当の顧客から「絶対に通せない内容のワークフローが上がってきて2回却下したんだけどさ、なんかそいつ他の上長を通して申請したっぽいんだよ。俺はその申請見られなくなってしまったっぽくてさ、そいつの申請の状態を早めに調査してくれない？他の上長に送れないように設定したはずなのになぁ」とボヤかれたとしよう。普通ならこういうのは対応しないだろうが、何にせよ我々は小さい企業であり、そこは超大口顧客なんだ。明日のおまんまのためにも対応しよう。

この場合は**依頼の温度感の連携が足りていない**。たいてい申請というのは翌日には承認されているものだ（ズボラな人じゃなければ）。そうなると翌日までに作業をする必要がある。ただ、突然来た依頼なので、大した気も払わずとりあえず「来週やることリスト」の一番下に入ってしまったら目も当てられない。

そういったものの把握のために様々な情報が必要なんだが、**その背景は依頼からわからない**。

## アドバイス

上記は若干無理やりな例だったかもしれないが、比較的類似の依頼を受けたことはある。依頼する側がスーパー人間で依頼内容をそのまま返せば問題ないのであればいいのだが、大抵の場合は**依頼を額面通りやっても想定する結果は得られない**。

第一に**依頼の背景が伝わっていないと正しい結果は返せない**。依頼の背景が正確にわかっていたら「このデータを返したほうが良いのでは」「この機能を使えるよ」と逆に提案さえ可能だ。
第二に**アウトプットの方法は常識ではない**。例えば依頼者は「どう考えてもCSV・エクセルファイル・スプレッドシートで返ってくる」と考えていても、依頼される側としてはそれはわからないため、最悪の場合件数をテキストで返すだけみたいな大きな齟齬が発生することもある。また、アウトプットするデータも暗黙になりがちだ。依頼者が「ワークフローの種類だけ欲しい」と思っていても依頼される側は何を出せばいいのかわからないので「ワークフローのテナント名」を出すかもしれない。
第三に**依頼の温度感は言わないと伝わらない**。急ぎの依頼であれば「明日までにやってほしい」と言うし、そうでない場合は「再来週とかでいいよ」と言う、それだけでいいのだ。が、それがくっついてこないこともある。依頼される側としては特にそこが分からないと期日に齟齬が発生してしまうかもしれない。
第四に**依頼の規模は確認しておくといい**。依頼の規模がでかくなると背景を伝える時間が長くなる・アウトプットが複雑になる・依頼に時間がかかるため期日通りにいかないこともある。**簡単な依頼だと思ってたけど依頼したら嫌な顔された**、**面倒くさそうな依頼だと思っていたが、言ってみたら意外に簡単だったらしい**ということはある。規模感の齟齬があると結末はいつだって悲しいので、温度感を伝えて確認すると良い。
最後に**依頼者が依頼を理解しているとは限らない**。何かを依頼するということは、何か解決する・何か調査する・何か生み出す、そういったことだ。依頼者が常に「何を解決するべきか」「何を調査するべきか」「何を生み出すべきか」なんて正確に理解しているはずがない。例えば解決するべき課題の根本原因が間違っているかもしれないし、調査するべき場所が違うかもしれないし、作るものの要件が違うかもしれない。これは**依頼される人と話すことで明確になることもある**。**上記の4つを伝えることで間違いがわかるかもしれない**。


# 依頼をする側のチェックリスト・基準

依頼をする側としては上記のアドバイスの裏返しを基準とすれば良い。

私は現在プロジェクトマネージャーっぽいことをやっているので、依頼内容は、プロジェクトに参加しているメンバーにタスクを振る・私に出来ないことを上長に頼む・関連する部署の人に他部署管轄のプロダクトの改修依頼をする、そ
ういったところだ。

それを踏まえると下記のようなことを考えるとよいだろう。

- 一呼吸置いて整理する
- 伝える相手の属性は何だろうか
- 依頼の規模感はどれぐらいだろうか
- 相手が依頼を達成するために必要な情報はなんだろうか
- 依頼が解決されると自分がやりたいことを達成できるようになるだろうか
- 期日を記載する・または温度感を伝える


## 一呼吸置いて整理してみよう

依頼をする前に、まずは一呼吸しよう。会話を始める前に・Slackに書き込む前に、**相手が依頼を達成するために必要な情報はなんだろうか**・**依頼が解決されると自分がやりたいことを達成できるようになるだろうか**、それを考える。こういったものには様々な思考の整理術が使えるだろう。また、その情報の整理のために**相手の属性**と**依頼の規模感**を考えることも重要だと思う。

思考の整理術の具体例として、[エンジニアが知っておきたい思考の整理術](https://amzn.asia/d/9uuMKt5)という本では**Category・Summary**、**Group・Parallel・Series**という考え方が紹介されている。ここでもその考え方が使えるはずだ。ものごとをカテゴリという分類し・分類ごとにサマリーするという要約。そして情報をグループという同種のものをまとめる・グループを並べるパラレル・それらを順序付けるシリーズという情報整理術のことだ。詳しくは本を読んだり、筆者による[ロジック図解・情報整理術実践講座](https://ideacraft.jp/)などを読むことをおすすめする。

**相手の属性次第**や**規模感**次第で雑に投げても問題なかったりするが、それでもまずは一呼吸置こう。足りなさそうだったらじっくり考えればいい。オススメなのは**文章で依頼を送った後会話する**ことだ。相手が在宅だったり別の場所の人であればリモート会議をしよう。
文章で書くことで**自分で依頼を読み直すことができる**。大抵の人間が文章を読んで→直して→読んで→直してを繰り返すだろう。そのため一度送った文章を読んで言葉を反芻し、適切な依頼を出すことができる。
明確になったら口頭で喋り、相手が理解できない点を・相手の提案を**インタラクティブ**に話すことができる。
Slackで100の会話を超えるスレッドはなかなか見たこと無いだろうが、会話を100往復するコストはかなり低い。最初は文章でやり取りしつつ、**やり取りが多くなったら会話をする**という方針でもいいだろう。

**重要なのは相手が期待通りのアウトプットをできるために必要な情報を渡すことなのだ**。

## 伝える相手の属性は何だろうか

一番最初に考えることは**相手がどういった人か**だ。相手は同じチームのメンバーなのか、上長なのか、他の部署のエンジニアなのか、営業の人なのか。これによって依頼に含めるコンテキストが大きく変わる。

基本的には**自分に近ければ近いほうが情報を省略できる**。ツーカーの関係なら依頼さえしなくていいかもしれない。チームメンバーであればGithubのコードのURLだけ渡して「このバグチケット、多分この辺に問題あるから調査して修正しておいて」と投げるでいい。

**一方で遠ければ遠いほど情報は必要だ**。例えばエンジニアではない人間では自分たちの常識と異なる常識で仕事をしている。チームメンバーに依頼するのであれば「SELECTしといて」といえばいいことを、営業に頼むなら「ここのスプシからデータを取ってきて」という感じになるだろう。**コンテキストが違うのだ**。
特に新卒の方などそういった大きく異なるコンテキストでコミュニケーションをしたこと無い人は自分の言葉で説明しがちだ。営業の人との会話に「このテーブルのこのカラムがこうなっているんでそれ難しいんですよね」と言ったところで通じない。**相手の言葉に翻訳するよう努力をする必要がある**。

また、**依頼のバックグラウンドを知っているかどうか**も重要だ。上記の例のようにプロジェクトのバックグラウンドを知らないとより適切なアウトプットが出てくる可能性を潰す。逆に私が依頼を受けるときにそういった情報がなければ、Slackなどで相手が今どういったことに課題が合って・取り組んでいて、何故この依頼をしてきたのかを調査している（聞けばいいんだが、調査は得意なのでコミュニケーションコストより調べるコストのほうが低い）。

## 依頼の規模感はどれぐらいだろうか

もう1つ重要なのは依頼の規模感だ。大雑把に相手にとって**簡単か**、**難しいか**程度だけ私は考えている。

規模感の大小を考えると、渡すべき情報が必要かどうかが変わる。

簡単な依頼、規模感の小さい依頼は正直情報が少なくてもどうにでもなることが多い。例えば上記の依頼例3はやること自体はとてもシンプルだ。「この会社のこの人が2回拒否したワークフローを出して。直近2週間で」と言うだけでいい。もちろん背景なんかがあると怪訝な顔をされなくて済む。

逆に規模感の大きい依頼はちゃんと情報を整理し渡す必要があるだろう。必要であれば30分ほどのミーティングを取る必要もある。上記の依頼例1はそれに該当するだろう。情報をまとめる方法は次移行に記載する。

## 相手が依頼を達成するために必要な情報はなんだろうか

伝える相手の属性は既に考えているため、そこから逆算して必要な情報を考える。

まず、経験上どんな場合でも書くべき点が2つある。

- **依頼の背景・目的**
- **依頼のアウトプットの型**

依頼の背景、目的はその名の通り。なんでこんな依頼をすることになったのか、そしてこの依頼が解決されるとどんなことに繋がっていくのかと言うのがあると良い。依頼される側としては、その情報があるとその目的に付随する追加情報を渡したり、その目的により適切なアウトプット・情報を提案できるようになる。

依頼のアウトプットの型は、依頼が解決されたときに出てくるもののことだ。これは続く[依頼が解決されると自分がやりたいことを達成できるようになるだろうか](#依頼が解決されると自分がやりたいことを達成できるようになるだろうか)にて記載する。

**この2つが決まればその他必要な情報は自ずと決まる**。相手のアウトプットに必要となる情報を渡せばいいだけだ。また、たとえそこが足りなかったとしても、背景・目的や依頼のアウトプットの型を相手に伝えていれば、**依頼した相手からこの情報が必要**ということが明確になる。


## 依頼が解決されると自分がやりたいことを達成できるようになるだろうか

何らかの依頼をするということは、**何らかの課題を解決するために行動している**のだ。そうなると**依頼が完了した後、その課題は解決できるのか**を考える。依頼が完了したときに出てくるのは成果、つまりアウトプットだ。**そのアウトプットが自分がやりたいことを達成できるのか**を考えることが重要だ。

アウトプットは、上記の依頼例で言えば情報という形だったが、機能追加という場合もあれば、画面の修正のみということもある。エンジニアだけではない話でも、例えば何らかのドキュメントを残すことかもしれないし、なにかの申請をすることかもしれない。一言で言うなら**相手が求めている「行為」「成果物」のこと**だ。

最近私の実際にあったこととして、上長から「この機能のエラーコードについてまとめておいて」と言われたので、他のエンジニアと会話するだけしておいた。ただどうやら「エラーコード一覧と発生箇所・理由をスプレッドシートにまとめておく」ということを期待されていたようで、そこに齟齬が発生していた。私は**まとめる行為**を期待していると思っていて、上長は**まとめたうえで関係者に把握できる形で残してくれ**ということを期待していた、ということだ。

そういった齟齬を無くすためにも、適当に指示を出すのではなくて**このアウトプットが出れば課題を解決できる**ということを考え、それを伝えるべきだ。例えばプロジェクトリーダーとして「ワークフローの管理画面を作ってくれ」という依頼ではダメだ。「ワークフローの管理画面のプロトタイプを作ってくれ。こういった項目を表示したいが、詳しくはプロダクトマネージャーと相談してくれ。また、とりあえず動く画面を再来週に作りたいから、最低限更新・削除の機能は作ってくれ。画面は並行してデザイナーと相談するから、表示項目の相談結果はデザイナーに共有しておいてくれ」ぐらいやらないとだめなわけだ。この情報量は「ワークフローの管理画面を作ってくれ」という依頼だけで伝わるわけがないのだ。
ただ、自分がプロダクトマネージャーで、相手が開発のリーダーであれば逆に「再来週までにワークフロー管理画面の動く画面作れる？」という依頼だけになるだろう。そういった細かい決めの話はプロジェクトリーダーのお仕事だ（多分）。
この違いは自分の解決するべき課題が違うからだ。プロダクトマネージャーにとっては再来週までにどんな形でもワークフローの管理画面が動きさえすればいいので、それ以上の成果は不要であるからだ。一方でプロジェクトリーダーとしては、プロダクトを破綻なく作る必要があり、可能な限りの手戻りを無くす必要があることも目標となる。もちろん依頼先のエンジニアがシニアエンジニアであればプロダクトバックログを起票するようにしてもらえばいいだけかもしれないし、相手が新卒であれば多少のマイクロマネジメントもしながら進める必要があるだろう（メンターの仕事かもしれないが）。

## 期日を記載する・または温度感を伝える

これは教科書的な話だが、**期日を記載する**ことは重要だ。依頼する相手はたいてい忙しい。依頼するに事足りる信頼のある人間はみんなから信頼されているのだ。そうなると期日が無いと後回しにされる。また、相手のスケジュール的に期日通りに難しい可能性がある。その場合は他の人に頼まなければならない。そういった判断できるためめ期日は書くべきだ。

また、期日がなかったとしても、温度感つまり「これは重要だ」「片手間でできる」ということを伝えることはやったほうがいい。そうすると依頼される側は「今週は難しいけど、来週であれば出来ますよ」とか「温度感低いなら、とりあえずタスクに積んでおきますが、来月とかになりますよ」といったコミュニケーションができる。つまり一定依頼が解決されるまでの時間を見積もることができる。

# まとめ

依頼前に、一呼吸置いて下記を整理しよう。特に規模感の大きい依頼は、**文章と口頭での依頼をセットにしよう**。

- 伝える相手の属性は何だろうか
- 依頼の規模感はどれぐらいだろうか
- 相手が依頼を達成するために必要な情報はなんだろうか
- 依頼が解決されると自分がやりたいことを達成できるようになるだろうか
- 期日を記載する・または温度感を伝える
