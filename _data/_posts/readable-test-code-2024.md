---
layout:      post
title:       読みやすいテストコードのために心がけること ver 2024.
category:    test
author:      sa2taka
tags:        test,jest,TypeScript
public:      true
createdAt:   2024-02-11
updatedAt:   2024-02-11
latex:       false
description:
   2年前に読みやすいテストコードのために心がけることを記載しましたが、それから2年経ち洗練されたと思うので、改めて書き出してみました。
---

以前[読みやすいコードとテストコードは評価軸が違う 〜 読みやすいテストコードのために心がけること](/post/readable-test-code.md)という記事を記載しました。
あれかれ2年。チームに[testing-library](https://testing-library.com/)[^testing-library]という革命児が到来しました。E2Eテストも始めました。チーム内でテストの書き方を話すことも増えました。テストに関するVSCode Extensionを2つ作りました[^vscode-extension]。シンプルに数万行ほどはTypeScriptのプロジェクトのテストコードを書いてもいます。

[^testing-library]: [JSDom](https://github.com/jsdom/jsdom)を利用して、フロントエンドの動作を単体テストとして簡単に記載できるライブラリ。つまり我々のチームでもフロントエンドのテストが簡単に書けるようになりました。

[^vscode-extension]: [テストとコードを行き来するExtension](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-teleporter)と[テストケースを一覧表示するExtension](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-test-outline)です。

今でもテストを書く際に上記の記事を読むことがあります。その度に「あぁそうだよな」と思うことも「ここもう少し詳しく書きたいな」と思うことも増えました。また、改めて考えをアウトプットすることの重要性を痛感します。考えが変わる部分は日々成長しているんだなと・考えが変わらない部分は「ここがコアな部分なんだな」と。
そこで再び考えのスナップショットを取ろうとアウトプットするのがこの記事となります。以前の記事を踏まえているものではありますが、本記事単体で完結するものになります。

ちなみに[単体テストの考え方/使い方](https://book.mynavi.jp/ec/products/detail/id=134252)を購入していますが、まだ読んでいないため、読んでから改めて追記する可能性があります。

# はじめに

本記事の前提の部分を記載します。

## 本記事のコード

本記事ではTypeScript及びJestで例のコードを記載しています。
それぞれ癖があると思われる部分は利用せず、一般的な他の言語・他のテストライブラリにもあるようなコードを記載します。

また、コードやテストコードの処理的な正しさは確認していないため、ビルドエラーや実行時エラーになる可能性があります。ニュアンスが伝われば幸いです。

## 「テスト」の対象

テスト、といっても様々あります。単体テスト？　結合テスト？　E2Eテスト？　ビジュアルリグレッションテスト？　負荷テスト？　手動？　自動？。

今回ターゲットにするのは、一般的には**単体テスト・Unitテスト**と呼ばれるものです。ですがこの単語のニュアンスも読者次第で大きく変わるものとなっていますので言い換えると**1つのファイル・クラス・コンポーネント・関数等に紐づくテスト**であり**永続的にCI等で自動実行されるテスト**をメインにしています。例えば `user.ts` に対して `user.test.ts` ですし、`create-user-service.ts` に対して `create-user-service.test.ts` が該当します。ただ、一般的に上位であるE2Eや（広義の）結合テストでも部分的に使える場合はあると思います。

また、フロントエンドのテストを記載する場合も参考になるとは思いますが、基本的には強いビジネスロジック・ドメインロジックが発生するバックエンドのテストを記載する場合を中心に記載しています。

:::information
1つのファイル・クラス・コンポーネント・関数等に紐づくと記載されていますが、対象が別のものに依存する場合でも単体テストです。名前的にIntegrationテスト・結合テストのように感じますが、本記事ではすべて単体テストと呼んでいます。

リファクタリングでも有名なMartin Fowler氏の[On the Diverse And Fantastical Shapes of Testing](https://martinfowler.com/articles/2021-test-shapes.html)や[Integration Test](https://martinfowler.com/bliki/IntegrationTest.html)を参考にして、そういったものも含めて単体テストと本記事では呼んでいます。

理由としては、基本的に単一のファイル（その中の複数の関数を対象にしているかもしれないが、いずれにせよ単一の対象）をテストしているのは変わらないため、それらを区別する理由がないと考えているからです。

別の分け方として、全く外部影響がないテスト（例えば純粋関数など）やモックやスタブをいれて外部（ここでいう外部は対象以外の関数など）の影響を一切受けないテストを単体テスト、モックやスタブを利用せずに外部の影響を受けるテストを結合テストと呼ぶ場合もあります。
これは特にKent C. Dodds氏の[Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)で採用されている考え方です。
Testing Trophyについて多くは触れないですが、「どこを手厚くサポートするべきか・時間をかけるべきか」という指針であり命名には大きな意味はないと私は考えています。
ちなみにMartin Fowler氏はTesting Trophyの統合テストを**Sociable (Unit) Tests** 、単体テストを**Solitary (Unit) Tests**と呼んでいます。本記事ではそちらを採用しています。

いずれにせよ、単一ファイル・関数・コンポーネント・クラスなどに対する自動テストを本記事では対象とする、ということです。
:::

# テストコードの方針

テストコード、というのは何のためにあるのでしょうか。

- 振る舞いが問題ないことを確認するため？
- 人手を介さずに高速にテストを行うため？

テストというのはプログラミング黎明期から当然存在していたものです。昔の時代であればテストはもっぱら人の手で行うコストの非常にかかる工程だったと想像できます[^test-cost]。そのため、我々プログラマーが記載するテストコードの「元々の」目的は、振る舞いが問題ないことを確認するためにコストをかけずに行うため、だったはずです[^sunit]。

[^test-cost]: [Waterfallを振り返った際](/post/waterfall-is-missing/#Royce%E6%B0%8F%E3%81%AE%E8%A8%80%E3%81%84%E3%81%9F%E3%81%8B%E3%81%A3%E3%81%9F%E3%81%93%E3%81%A8%20-%20%E7%B5%90%E8%AB%96)にそのあたりの事情が垣間見えました。

[^sunit]: [SUnit](https://swing.fit.cvut.cz/projects/stx/doc/online/english/tools/misc/testfram.htm)はxUnitシリーズの一番最初のSmalltalk用のテストツールですが、上記記事のPhilosopyを読むと、少し異なることが書いています。テスターはテストを最新の情報に保ち、false negativeやfalse positive（原文だとfalse failures and false successes）に多くの時間をかけていると記載があります。これはSmalltalk自体がGUIと結びつきの強い言語であり、ロジックと実際のインターフェースとの乖離があることから発生する、言語特性に関わるコストだと考えられます。

一方で、自動テストが当たり前になった今の時代ではテストコードには新たな役割が増えていると考えます。

CIの文化が成熟するにつれ、何度も何度もテストを行うことが低コストで可能になりました。その結果として、テストコードが永遠にコードの正しさを証明することとなります。チームによっては10年間同じテストコードが休むことなくCIを照らし続けていたことでしょう。そうするとコードの正しさを永遠に証明できるため、リファクタリングがしやすくなったりデグレ[^degrade]を防ぐようなこともテストの利点として数えられるようになりました。
これはすなわち**テストコードの寿命も非常に長くなるということです**。

[^degrade]: デグレ（デグレード）はとある変更をいれたことで、異なる処理に影響が発生し問題が発生することです。例えばユーザーIDの採番を連番からランダムな数字にしたら、IDのソートで生成順を担保していた処理で想定外の事象が発生するようになった、といったことです。これの発生を抑えるためのテストをリグレッションテストと呼んだりします。

コードの息が長くなればなるほどテストコードの重要性は増します。既存の処理、それも何年も前の処理に新たな仕様を加えるのはテストコード無しにはやりたくないです。テストがあれば既存の振る舞いを壊さないことを担保できますが、一方でテストコードが非常に読みづらい・メンテしづらい・テストケースを追加しづらい場合だとそれはまた別の問題を発生させます。
これにより**テストコードにも高いメンテナンス性を求められるようになりました**。

テストコードはCIの登場により非常に重要性を増しました。テストが誤っている場合、誤ったコードの変更をテストが検知できないケースがあり、CIは通っているからちゃんとした動作確認をしないでPRを通すという可能性も大いにありえます。
すなわち、テストコードも重要性が高くなるため、テスト自体の正しさというのも（当たり前ですが）重要になってきます。割れ窓理論でもありますがCIが当たり前の用に落ちているという状況は最悪ですし、CIを通すために網羅性が低かったり、モックを多用したりするのも避けるべきです。Flaky[^flaky]なテストも誤ったテストと考えられるため、早期に修正するべきです。
つまり**テストコードは常に真に正しくなければなりません**。

[^flaky]: 実行環境・ランダムな値・実行順序などにより全く同じコード・テストコードなのに通ったり落ちたり結果が不確実なテストのことをFlakyなテストと呼びます。


上記を踏まえ、下記を方針として、下記を達成するための考え方や方法論を記載していきます。

- ***テストコードは仕様を表すこと。***
    - テストコードは常に真に正しくなければならないため、それはすなわちテストコード自体が仕様であればテストコードが常に正しくなるはずです（または仕様が誤っている）。
    - これは後述しますがBDDの概念や、Kent C. Dodds氏による「テストがソフトウェアの使用方法に似ているほど、より信頼できるようになります」という言葉にも近いものです。
- ***テストコードはテストケースを追加しやすいこと。***
    - テストの網羅性・メンテナンス性を高めるために非常に重要です。
    - 例えば、テストを行うためにモックの前提条件を整理してモックの動作を記述する・何十行もある準備処理を細かくなどはテストケースを追加しづらい状態です。
    - テストケースを追加しやすいという状況は、結果的にテストコードの読みやすさにも繋がります。しかし、「テストコードの読みやすさ」は通常のコードの読みやすさと異なる視点があります。
- ***テストコードは可能な限り動作環境と同じであること。ただしコストは低いこと。***
    - テストコードが真に正しいと言えるためには、テストコードの動作が可能な限り実態に即している必要があります。これはすなわちモックや前提条件などを本番に近づける必要があるということです。
    - 究極的にはすべてのテストがE2Eであればよいですが、これは「テストケースを追加しやすいこと」という哲学に反するケースも多いでしょうし、シンプルにコストが高いはずなので、現代では単体テストが利用されるはずです。

:::info
この記事を書いていて調査していたところ、「ロンドン派」と「デトロイト派」というテストのモックに対する派閥があることを知りました。[On the Diverse And Fantastical Shapes of Testing](https://martinfowler.com/articles/2021-test-shapes.html)では前者をMock派（Mockist）・後者を古典派（Classic）と呼んでいるようで、「ロンドン派」はモックを多用する・「デトロイト派」はモックを可能な限り利用しないという違いがあるようです。

私はデトロイト派ですが、「いわゆる原理主義者」ほどモックの利用に強いルールは敷いていないです。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">テスト駆動開発にはざっくりいうとモックを積極的に使う派（ロンドン学派）とあまり使わない派（デトロイト学派、古典派）がありまして、私は後者なのでほとんど使わず、このエントリに深く同意するところです / “モックは必要悪で、しないにこしたことはない - …” <a href="https://t.co/VjDvospTKu">https://t.co/VjDvospTKu</a></p>&mdash; Takuto Wada (@t_wada) <a href="https://twitter.com/t_wada/status/1448864195357777928?ref_src=twsrc%5Etfw">October 15, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
:::

# コードはテストケースを満たすために書く

一般的にテストコードはコードの正しさを検証するためのものですが、逆転の発想です。**テストケースが最初にあり、コードはあくまでそのテストケースを満たすための産物でしかないという考え方です**。
一瞬突飛な考えのように感じますが、我々プログラマーにとってTDDという考え方は一般的ですし、それを考えると決して相容れない考え方ではないと思います。

ここで重要な概念は**テストファースト**です。テストファーストはTDDと完全一致ではありません。あくまでテストを中心に考えましょうね・テストケースから考えましょうねというものであり、TDDはその実装論の1つです。

一般的にはTDD・BDD、それから派生したATDDが有名です。方法論はチーム方針・個人の好み・システムの特性等が関わってくるため、どれがいいというのはないでしょう。

**TDD**(Test Driven Development)はその名から最初にテストを書けば良い、という印象を持ちますが、定義としては異なります。仕様から1つ選択肢それをテストケースとして記載しそれが落ちること（Red）を確認・続いて実装を修正し対象のテストが通ること（Green）を確認・最後に実装をリファクタリングする（Refactor）という短いサイクルを繰り返すことをTDDと呼びます。

**BDD**（Behavior Drive Development）は一般的には自然言語で記載されるシナリオという単位でテストケースを記載していくことです。特にアジャイル開発では非エンジニアであるドメインエキスパートやお客様などを巻き込んで開発するので、そういった人たちを巻き込んでシナリオを作っていくことをBDDと呼んでいる印象があります。

TDDは合う人には合うのでどんなときでも使える手段だと思いますが、私はTDDを使うときと使わないときがあります。一方BDDはBDDで、わざわざテストケースとは異なるシナリオというものを作るのは面倒です。システム特性的に難しいケースもあります。
私は基本的に全く新しい処理を記載する場合はBDDに近い方法を利用します。私は仕様駆動テスト（Specification Driven Test）なんて呼んでたりします。既存の処理に新たな仕様を加える場合はTDDのようになる場合がありますが、考え方は一緒です。

具体的な例で説明します。X（旧Twitter）のような短文投稿サイトで「特定のユーザーのメディア付きツイートを取得できる」という機能の開発をするとします。

私はまずは**すべての仕様**をテストケースの説明として並べていきます。たとえ巨大だったとしても全部書くことが多いです。

```typescript:テストケースだけ.ts
describe("fetchTweetsWithMedia", () => {
  it("media付きのツイートが取得できること", () => {});

  it("mediaがついていないツイートは取得できないこと", () => {});
})
```

その後は場合によって「動作を書いてからテストケースの実装を書く」、または「テストケースの実装を書いてから動作を書く」のどちらかを行います。テストファーストであれば後者の方がいいですが、実装が単純な割にテストケースが複雑になりそうなケース・テストに慣れていない場合（私は特にtesting-libraryに慣れていないため、フロントエンドでは実装が先になる場合も多いです）などが該当します。
そういった場合でも、自然言語でテスト内容を記載しています。テストを全部でなくとも、具体的な前提条件を記載してあげると良いです。


```typescript:自然言語でテスト内容を記載した.ts
describe("fetchTweetsWithMedia", () => {
  it("media付きのツイートが取得できること", () => {
    // user1のmedia付きツイートをDBに保存する
    // const tweets = fetchTweetsWithMedia(user1);
    // tweetsが保存したものと同じことを確認する
  });

  it("mediaがついていないツイートは取得できないこと", () => {
    // user1のmediaのないツイートをDBに保存する
  });
})
```

```typescript:実際にテストを記載した.ts
describe("fetchTweetsWithMedia", () => {
  it("media付きのツイートが取得できること", async () => {
    const user1 = TestUserFactory.build();
    const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [TestMediaFactory.build()] });
    await TweetRepository.create(tweetWithMedia);

    const tweets = fetchTweetsWithMedia(user1);

    tweets.toEqual([tweetWithMedia]);
  });

  it("mediaがついていないツイートは取得できないこと", () => {
    // ...
  });
})
```

ここで重要なのは方法論ではなく**テストを実装に依存させない**ことです。方針の「*テストコードは仕様を表すこと*」に近いことですが、テストはコードを対象に取らずに仕様を対象に取るとメンテナンス性が高く・真に正しいテストを記載できます。
テストが実装に依存することの何が駄目なのか。個人的には2つデメリットがあると思います。

- 実装に依存したテストケースが生まれます。特に時間をかけると仕様が抜けてしまい、最終的にテストケースから仕様が抜ける場合があります。
- 実装に依存した前提条件が生まれます。結果として「このテストケースを通すためにはこういう前提条件にすればいい」という手段と目的が入れ替わる場合があります。
    - また、モックを多用する場合は、テストケースを通すためのモックを作成してしまうかもしれません。

上記のテストは記載してからしばらくは良いのですが、1年後・2年後、改めて対象のファイルを修正しようとした時に実際の動作と動作とテストが大きく乖離している場合があります。これは「*テストコードは可能な限り動作環境と同じであること*」という方針に違反しています。また修正を加える場合にはなんでこの前提条件があるのか・なんでこんな仕様があるのかという疑問が発生し、この部分の理由を探すために時間をかけることになり「*テストコードはテストケースを追加しやすいこと*」にも違反する可能性もあります。

## 実装時にテストケースを増やしてはいけない、ということではない

忘れてはいけないのが**仕様が正しいとは限らない**ということです。方針としては「*テストコードは仕様を表すこと*」としていますが、仕様が正しくなければテストも、そしてその実装も正しくないことになります。

一方でプログラムを書いていると、「あれ、このケースどうするんだ」とか「ここでこの値が来るときの仕様があやふやだな」となることは往々にしてあると思います。また、チームに数年在籍していたりシニアプログラマーが「こういったケースでエラーになるから注意しないとな」とか「ここで呼んでいるこの処理って特定のケースだとエラーになるけどどうするんだ」など経験則/勘で仕様の不具合に気づくケースがあります。こういったことを**探索的テスト**と呼ぶらしいです。

こういった実装中に何らかの仕様に気づくケースだったり、足りないテストケースが浮かび上がるケースはあります。思いついたんだから追加すればいいですし、必要であれば関係者へヒアリングして仕様を固めることも重要です。

# テストケースの中だけで語れ

旧：[テストコードにおけるDRYは善でも悪でもない](https://blog.sa2taka.com/post/readable-test-code/#%E3%83%86%E3%82%B9%E3%83%88%E3%82%B3%E3%83%BC%E3%83%89%E3%81%AB%E3%81%8A%E3%81%91%E3%82%8BDRY%E3%81%AF%E5%96%84%E3%81%A7%E3%82%82%E6%82%AA%E3%81%A7%E3%82%82%E3%81%AA%E3%81%84)

一般的なコードは、同じことを何度も書くことは悪とされます。これについてはDRY(Do not Repeat Yourself)原則とOAOO(Once And Only Once)原則の2つがあります。意味論的にはちょっと違いますが、深くは言及しません。
一方で、テストコードでは必ずしもそうでは有りません。似たようなコードをまとめることが読みづらさの原因になることがあります。

前章で出した`fetchTweetsWithMedia` のテストケースの実装が下記のようになっていました。

```typescript:改善前のコード.ts
describe("fetchTweetsWithMedia", () => {
    const user1 = TestUserFactory.create();
    const user2 = TestUserFactory.create();

    const tweetWithoutMedia = TestTweetFactory.build({ user: user1 });
    const media = TestMediaFactory.build();
    const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [media] });
    const otherUserTweet = TestTweetFactory.build({ user: user2 });

    // beforeAll は jest の機能の一つであり、同じスコープ以下のテストケース全体の前に一度だけ実行するものです
    beforeAll(async () => {
        await UserRepository.create(user1);
        await UserRepository.create(user2);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);
        await TweetRepository.create(otherUserTweet);
        await MediaRepository.create(media);
    });

    it("media付のツイートだけ取得できること", async () => {
        const tweets = await fetchTweetsWithMedia(user1);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const tweets = await fetchTweetsWithMedia(user1);

        // 下記はtweetWithoutMediaが配列内に存在しないことを確認するコード
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
});
```

一件良さそうに見えます。しかしながら、上記は脳内メモリを結構食います。コードレビューをする人だったり、実装を追加するために読む場合は、基本的にテストケースを最初に読みます（人それぞれでしょうが）。

おそらくテストを記載した人は前処理をすべて一箇所、具体的に言えば `beforeAll` とその直前にまとめたかったのだと思います。そこで `it` の中だけを読んでみましょう。

```typescript:改善前のコード(抜粋).ts
    it("media付のツイートだけ取得できること", async () => {
        const tweets = await fetchTweetsWithMedia(user1); // <-- user1って誰?

        expect(tweets).toEqual([tweetWithMedia]); // <-- tweetWithMedia、多分media付きのツイートなんだろうな
        // <-- あれ、tweetWithMediaってuser1が呟いていたものだっけ?
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const tweets = await fetchTweetsWithMedia(user1); // <-- user1って誰? あ、さっきも出たな

        // 下記はtweetWithoutMediaが配列内に存在することを確認するコード
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia])); // <-- tweetWithoutMedia、多分mediaついてないんだろうな
        // <-- あれ、こいつもuser1が呟いたものなんだよな?
    });
```

コメントに記載した `<--` で記載したところは、 `it` の中だけを読んだ人の確認する事項です。6箇所の確認事項があります。もちろん`beforeAll` やその直前をちゃんと読んで、前提条件を完全に理解して読み進めれば確認事項は少ないですが、定義場所と距離が有りすぎます。

私も正直、変数名からの予想や「〜なんだし〜は自明だろう」と信じて書き進め・読み進めてしまうタイプなので、テストを記載する場合上記のような記載をしてしまう可能性もありますが、あまり読者（レビュワー・このテストを参考にする人・明日の貴方）に優しくないです。上記のテストはまだ100行にも満たないですが、数100行に渡る場合、単純に行ったり来たりで面倒くさいです。

ここで、新しく上記の機能に「特定時間以降に作成されたツイートに限定する」という仕様が追加されたとしましょう。テストはどうなるでしょうか。

```typescript:改善前に新規機能を追加したコード.ts
describe("fetchTweetsWithMedia", () => {
    const user1 = TestUserFactory.create();
    const user2 = TestUserFactory.create();

    const thresholdTime = subDate(new Date(), 30); // 追加

    const tweetWithoutMedia = TestTweetFactory.build({ user: user1 });
    const media = TestMediaFactory.build();
    const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [media], createdAt: addHour(thresholdTime, 1) }); // 変更
    const createdBeforeThreshold = TestTweetFactory.build({ user: user1, mediaList: [media], createdAt: subHour(thresholdTime, 1) }); // 追加
    const otherUserTweet = TestTweetFactory.build({ user: user2 });

    // beforeAll は jest の機能の一つであり、同じスコープ以下のテストケース全体の前に一度だけ実行するものです
    beforeAll(async () => {
        await UserRepository.create(user1);
        await UserRepository.create(user2);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);
        await TweetRepository.create(createdBeforeThreshold); // 追加
        await TweetRepository.create(otherUserTweet);
        await MediaRepository.create(media);
    });

    it("media付のツイートだけ取得できること", async () => {
        const tweets = await fetchTweetsWithMedia(user1);

        expect(tweets).toEqual([tweetWithMedia, createdBeforeThreshold]); // 変更
    });

    // ...

    it("時間を指定した場合、それ以降のMedia付きツイートのみに絞ること", () => { // 追加
         const tweets = await fetchTweetsWithMedia(user1, thresholdTime);

        expect(tweets).toEqual([tweetWithMedia]);
    })
});
```

一個テストケースを増やすために、様々な場所を修正する必要があります。もちろん仕様が変わる事によって大きく前提条件を変える必要があるケースもありますが、今回はうまく作ればテストケースを1つ増やすだけで良かったはずです。これは「*テストコードはテストケースを追加しやすいこと*」に違反しています。

**テストコードの目的は短いテストを書くことではないです**。テストコードの行数を減らすことは一旦忘れて、**前提条件は `it` の中に押し込めるほうがベスト**です。具体的な理由は[AAAを意識して、コードを削減する](#AAAを意識して、コードを削減する)に記載していますが、その他の合理的な理由の1つとしてテストケースと前提条件との物理的な距離が遠くなるのを防げる効果があります。

```typescript:テストケースの中にすべてまとめたコード.ts
describe("fetchTweetsWithMedia", () => {
    const user2 = TestUserFactory.create();

    const otherUserTweet = TestTweetFactory.build({ user: user2 });

    beforeAll(async () => {
        await UserRepository.create(user2);
        await TweetRepository.create(otherUserTweet);
    });

    it("media付のツイートだけ取得できること", async () => {
        const user = TestUserFactory.create();
        const tweetWithoutMedia = TestTweetFactory.build({ user: user1 });
        const media = TestMediaFactory.build();
        const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [media] });

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
       // ...       
    });
});
```

正直行数は倍になりましたが、 `it` の中にすべてが記載されるようになりました。

```typescript:テストケースの中にすべて突っ込んだコード(抜粋).ts
    it("media付のツイートだけ取得できること", async () => {
        const user = TestUserFactory.create();
        const tweetWithoutMedia = TestTweetFactory.build({ user: user1 });
        const media = TestMediaFactory.build();
        const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [media] });

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });
```

ただし、これだと前提条件の記載が面倒くさいため、先程よりはマシですが「*テストコードはテストケースを追加しやすいこと*」という方針としてはより追加しやすい状態にしたいですね。

:::info
言語やテストライブラリによってベストプラクティスや普遍的に利用されているテストのパターン、使える機能などが異なるため、共通化が常識な場合もあります。
Rubyの有名なテストライブラリの1つであるRSpecを例にしましょう。今回のテストケースはコードは下記のような記載がされると思います（RSpecあんまり書いたこと無いので嘘かもしれません）。

```ruby:RSpecで書き直したコード
RSpec.describe "fetchTweetsWithMedia" do
    context "Media付ツイートとMediaのついていないツイートが存在する場合" do
        let(:user) { User.new }
        let(:media) { Media.new }
        let(:tweetWithMedia) { Tweet.new(user: user, media: @media) }
        let(:tweetWithoutMedia) { Tweet.new(user: user )}

        before :all do
            UserRepository.create(@user)
            MediaRepository.create(@media)
            TweetRepository.create(@tweetWithMedia)
            TwetRepository.create(@tweetWithoutMedia)
        end

        subject { fetchTweetsWithMedia }

        example "Media付ツイートが取得できること" do
           is_expected.to eq [@tweetWithMedia]
        end

        example "Media付きでないツイートは取得できないこと" do
           is_expected.to_not contain_exactly @tweetWithoutMedia
        end
    end
end
```

RSpecでは `let` や `subject`および `before` を多用します（するイメージがあります）。RSpecに慣れてない僕からしたら上記のコードを読みやすいとは思いません。しかし言語・テストフレームワーク、更にはコードを書いているチームによって共通化に関する考えは異なるので、郷に入らない限りはそれがベストかどうかはわかりません。

`let`や`context`というJestにはない機能やブロックが存在するなど意味論的にJestとは大きく構造が異なるとは思いますが、正直RSpecの共通処理はやりすぎ（少なくともRSpecについて知らない人は一切読めない、`subject`と`is_expected`の関係とか）だと私は思います。Rubyがそこそこ自由度の高すぎる言語故だとは思いますが
:::

# AAAでテストを語れ

旧：[AAAまたはGiven-When-Thenをテストケースに押し込もう](https://blog.sa2taka.com/post/readable-test-code/#AAA%E3%81%BE%E3%81%9F%E3%81%AFGiven-When-Then%E3%82%92%E3%83%86%E3%82%B9%E3%83%88%E3%82%B1%E3%83%BC%E3%82%B9%E3%81%AB%E6%8A%BC%E3%81%97%E8%BE%BC%E3%82%82%E3%81%86)

テストケースには **AAAパターン**と呼ばれるパターンがあります。これは

- Arrange（用意する）: 前提条件と入力を用意する
- Act（実行する）: テスト対象のコードを実行する
- Assert（表明する）: 期待されるべき出力を表明する

の頭文字です。他にAssemble-Activate-Assertという語を利用する場合もありますが、いずれも同じ意味です。
またBDDではGiven-When-Thenというシナリオパターンを利用しますが、そのような考え方がテストでは重要です。

簡単に言えば「これこれこういう条件の場合」「これをやったら」「こうなる」というのがテストの本質であり、この順番にテストを書きましょうね、ということです。

先程のテストケースをAAAの3つに分割すると下記のようになります。

```typescript:AAAに分割したテストケース.ts
    it("media付のツイートだけ取得できること", async () => {
        // Arrange
        const user = TestUserFactory.create();
        const tweetWithoutMedia = TestTweetFactory.build({ user: user1 });
        const media = TestMediaFactory.build();
        const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [media] });

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        // Act
        const tweets = await fetchTweetsWithMedia(user);
        
        // Assert
        expect(tweets).toEqual([tweetWithMedia]);
    });
```

## AAAを意識して、コードを削減する

経験則として、基本Arrangeがテストコードをほとんど圧迫します。なので、`beforeAll` などの処理にこのArrangeが記載されていることがあります[^assert]。

[^assert]: ちなみに、時々Assertが圧迫することもありますが、それらが`afterEach`（jestにおいて、テストケースの実行後に都度実行される処理）などに入っているのは多分無いと思います。Assertが圧迫する場合は、テストケースを分離するか、複数のAssertをまとめて1つの関数にする方法がおすすめです。具体的なlintハックですが、eslintを利用している場合テストケースの中に`exepct`関数がない場合、エラーやwarningになる場合があります。それを回避するテクニックとしてファイル先頭に `/* eslint jest/expect-expect: ["warning", { "assertFunctionNames": ["expectをまとめた関数名"] }] */`を記載するという方法があります。詳細は[lintの説明](https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/expect-expect.md)を参照のこと。

私はbeforeAllを始めとして「すべてのテストケースで利用するオブジェクトの共通化」には賛成ではありません。
もちろん変数の定義箇所と利用箇所の物理的距離が離れる・他のテストケースで対象のオブジェクトが変更される可能性があるなど直接的な要因もありますが、どちらかというと概念的に **「テストケースには必ず条件・テスト対象・期待される出力や動作」が記載されているべき** と考えているからです。

というのも、共通化されたオブジェクトはそれぞれ「**どのテストケースの前提条件なのか一切わからない**」ためです。
改善前の最初のテストコードを見てみましょう。

```typescript: 改善前のコード.ts
describe("fetchTweetsWithMedia", () => {
    const user1 = TestUserFactory.create();
    const user2 = TestUserFactory.create();

    const tweetWithoutMedia = TestTweetFactory.build({ user: user1 });
    const media = TestMediaFactory.build();
    const tweetWithMedia = TestTweetFactory.build({ user: user1, mediaList: [media] });
    const otherUserTweet = TestTweetFactory.build({ user: user2 });

    // ...

    it("media付のツイートだけ取得できること", async () => {
        // ...
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        // ...
    });
});
```

`user1`ってどこで使っているの？　すべてのテストケース？　一部のテストケース？ `tweetWithoutMedia`は？　テストケースが2つしかないのでまだ全部見ればいいだけですが、もっとあったら確認するだけで大変です。

beforeAllなどに条件を書くのはやめたほうがいいとは思いますが、しかしながら、**条件を把握できればその記載の方法は何でもいいわけ**です。上記のテストを利用して、その `Arrange` の内容を削減しましょう。

まずは、今回のテストのAAAを日本語で考えてみましょう。複雑なテストを書くとき、我々の第一言語を利用すると明確になることもあります。

```typescript:日本語で考えてみた.ts
    it("media付のツイートだけ取得できること", async () => {
        // Arrange
        // 対象のuserの
        // - media付きのツイートがデータベース上にある
        // - mediaのついていないツイートがデータベース上にある
        // 場合に

        // Act
        // 対象のuserのmedia付きのツイートのみを取得する場合

        // Assert
        // 対象のuserのmedia付きのツイートのみ取得できること
    });
```

正直 `Act` と `Assert`が息をしていませんが、大事なのは `Arrange` の条件です。ソースコードであれば8行使っていたのに日本語では3行です。これをコードで表現してみましょう。

```typescript:Arrangeの部分の処理を共通化してみた.ts
describe("fetchTweetsWithMedia", () => {
    // JavaScriptを知らない人のために記載しますが async () => ...は非同期処理であることを表しています。戻り値は Promise という非同期の為の型になります。
    // await addUserIntoStore(); という感じにすると同期的に実行しているように見えますので、普通のプログラムと同じ感じに読んでいただいて大丈夫です
    const addUserIntoStore = async (): Promise<User> => {
        const user = TestUserFactory.build();

        await UserRepository.create(user);

        return user;
    }

    const addMediaIntoStore = (): Promise<Media> => {
        const media = TestMediaFactory.build();

        await MediaRepository.create(media);

        return media;
    }

    // TypeScriptを知らない方のために説明しますが、 with? という末尾にある?は、対象のパラメーターが必須ではないことを表します。なので {user: new User()}でも{user: new User(), with: new Media()}のどちらでもOKです。
    const addTweetIntoStore = ({user, with}: {user: User, with?: Media}): Promise<Tweet> => {
        const tweet = TestTweetFactory.build({ user, with })

        await TweetRepository.create(tweet);

        return tweet;
    }

    const user2 = TestUserFactory.create();

    const otherUserTweet = TestTweetFactory.build({ user: user2 });

    beforeAll(async () => {
        await UserRepository.create(user2);
        await TweetRepository.create(otherUserTweet);
    });

    it("media付のツイートだけ取得できること", async () => {
        // Arrange
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        // Act
        const tweets = await fetchTweetsWithMedia(user);

        // Assert
        expect(tweets).toEqual([tweetWithMedia]);
    });
// ...
});
```

`add〜IntoStore`という名前で戻り値が`User`とか`Tweet`とかなのが気持ち悪いのはともかく（名前的に戻り値はデータベースに追加したときの情報）、それらの関数を追加したことでitの中身の分量が大きく削れました。
コード量だけで言えば、改善前の方が少ないのですが、当然複数のテストケースがありますので、テストケースが多いほど相対的にコード量は減っていきます。

```typescript:Arrangeの部分の処理を共通化してみた.ts
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
```

また `beforeAll` などitの外に記載する共通化と大きく異なるのは, itの中にAAA、特にArrangeが記載されることです。そのため、itの説明文を読み・前提条件を読み・何を行っているかを読み・何を検証しているのかを読むという、上から下にただ読むだけでよくなります。

また、これにより「*テストコードはテストケースを追加しやすいこと*」というのはよりやりやすくなりました。テストケースごとに独立しているため、テストケースをコピペして、前提条件と確認事項を少し修正すれば他のテストに影響を与えずにテストケースを追加できます。

## Arrangeの用意方法色々

上記にも記載しましたが、Arrange部分は大体の場合テストコードの大半を占めます。後述しますが前提条件というのは重要な意味をもつ部分も多い一方で、大半はおまじないのようなコードに近いです。上記では`add〜IntoStore`関数を作成して短くしましたが、それ以外の方法を考えてみます。

### 特に用意しない

言っていることと結論が違いますが、前提条件が存在しなかったり数行で用意できる場合は現実的な解ですね。純粋関数のテストだったり複雑度が低いものに対するものですね。

### 単体のモデルの生成と保存を同時に保存する関数を用意する

上記で記載した方法がまさにこれです。モデルを生成する・DBに保存するという処理をモデルごとに関数として用意します。

私はやっていませんが、チーム内で同意があれば共通処理として切り出すことも容易です。
一方でテストファイルごとに関数を用意すると、共通する前提条件をその関数に押し込めることができます。私はどちらかというとこのメリットを重視して共通処理としてはあまり切り出していないです。数行で作れるのでコストは低いですしね。

### 複数のモデルの生成と保存を同時に保存する関数を1つ用意する

[フロントエンド開発のためのテスト入門](https://www.shoeisha.co.jp/book/detail/9784798178639)という書籍で紹介されていて、なるほどなぁと思い取り入れたものとして、setup関数という1つの関数を用意してテストは毎回それを呼び出す、というものです。
フロントエンドでは特に対象の作業するまで多くの操作が必要な場合があります。例えば特定のダイアログをテストする場合、そのダイアログを開くという操作する必要がありますが、それを毎テスト書いていたら面倒なのでsetup関数にダイアログを開くという処理（特定のボタンをクリックする、みたいな処理です）を記載します。
バックエンドでもsetup的な関数の考えは十分取り入れられる場合はあります。今回のケースだと下記のような感じでしょうか。

```typescript:setup関数を利用したArrangeの削減
// Partial<>というのはTypeScriptの型です。すべてのプロパティを任意のプロパティにするという意味です。
const prepare = async (tweets: { user: User, media?: Media, additionalTweetProps: Partial<Tweet>}[]) => {
  return await Promise.all(tweets.map(async (tweet) => {
    // ...additionalTweetProps というのは、JavaScriptのスプレッドという構文です
    // 詳しくは記載しませんが、いい感じに展開されます。
    // 例えばadditionalTweetPropsが `{ createdAt: new Date() }` なら、createdAtだけその値になります。
    const tweet = TestTweetFactory.build({ mediaList: tweet.media ? [tweet.media] : [], ...additionalTweetProps })
    await TestRepository.create(tweet);
    return tweet;
  }))
}

...

    it("media付のツイートだけ取得できること", async () => {
        // Arrange
        const user = TestUserFactory.build();
        // 下記は分割代入という構文です。prepareは配列を返しますが、下記の書き方をすると最初の要素を代入します
        const [tweetWithMedia] = await prepare([{ user, media: TestMediaFactory() }, { user }])

        // Act
        const tweets = await fetchTweetsWithMedia(user);

        // Assert
        expect(tweets).toEqual([tweetWithMedia]);
    });
```

今回のケースだとあまりうま味はなさそうですが、例えばモックの用意・関連するモデルがシンプルに多い・事前に呼び出す関数が多いなどのケースの場合にとても効力を発揮します。

# 暗黙的なテストコードを炙り出せ

旧：[暗黙のテストケース](https://blog.sa2taka.com/post/readable-test-code/#%E6%9A%97%E9%BB%99%E3%81%AE%E3%83%86%E3%82%B9%E3%83%88%E3%82%B1%E3%83%BC%E3%82%B9)

現状のテストコードがこちらです。

```typescript
describe("fetchTweetsWithMedia", () => {
    const addUserIntoStore = async (): Promise<User> => {
        const user = TestUserFactory.build();
        await UserRepository.create(user);
        return user;
    }

    const addMediaIntoStore = (): Promise<Media> => {
        const media = TestMediaFactory.build();
        await MediaRepository.create(media);
        return media;
    }

    const addTweetIntoStore = ({user, with}: {user: User, with?: Media}): Promise<Tweet> => {
        const tweet = TestTweetFactory.build({ user, mediaList: with ? [with] : [] })
        await TweetRepository.create(tweet);
        return tweet;
    }

    const user2 = TestUserFactory.create();

    const otherUserTweet = TestTweetFactory.build({ user: user2 });

    beforeAll(async () => {
        await UserRepository.create(user2);
        await TweetRepository.create(otherUserTweet);
    });

    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
});
```

`user2`と`otherUserTweet`がとても気になりませんか？

`fetchTweetsWithMedia` の第一引数にユーザーを渡しているのを見るに、おそらく指定したユーザーのツイートを取得する機能っぽいですね。ただ現状のテストケースだと残念ながらそれは「*テストコードは仕様を表すこと*」を達成できていないようですね。
正直自明すぎる要件なのでわざわざテストケースを記載しない気持ちも分かります。一方で、上記方針は達成できていませんし、AAAからあぶれていてなぜこの値がここに記載されているか不明ですよね。

もちろん最初に「仕様元にテストケースを書く」というのを遵守していればこういったことは発生していないかもしれません。一方で、こういった暗黙的なテストケースというのは`beforeEach`などに書いて満足してしまいがちです。なのでいっそのこと `beforeAll` や `beforeEach`（jestにおいてテストケースの実行前に都度実行される処理）を**削除することをおすすめ**します。もちろん`beforeAll`だけではなく、describe直下にあるようなコードも、関数の定義のみだけにするとこのようなことは絶対に起きなくなります。私は新しくテストを書く際は `beforeEach` などをしばらく使っていないですが、大して困ってないです。

消すタイミングでテストケースが必要であることがわかるでしょうし、そもそも`beforeEach`を使わない前提であればこういった暗黙的なテストケースが入る余地はありません。

```typescript:他のユーザーのツイートが取得できないことのテストケース.ts
    it("他のユーザーのツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const targetmedia = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: targetmedia });
        const nonTargetUser = await addUserIntoStore();
        const nonTargetMedia = await addMediaIntoStore();
        const otherUserTweet = await addTweetIntoStore({user: nonTargetUser, with: nonTargetMedia });

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
        expect(tweets).not.toEqual(expect.arrayContaining([otherUserTweet]));
    });
```

新たにテストケースを作成しましたが、ここで先程と異なる条件があります。それは、`otherUserTweet`にMediaがくっついていることです。

テストケースを記載しているときにとあることに気づきます。「あれ、これ他のユーザーのツイートを取得できないことではあるが、『他のユーザーのツイートだから取得できない』のが『Mediaのついていないツイートだから取得できない』のかわからないな」と。

単体テストに限らず、様々な検証で最も大事なことは **テストでの確認項目以外の対象の条件を揃える**ことです。今回で言えば「他のユーザーのツイートは取得できないこと」がテスト対象なので「取得できるツイート」と「取得できないツイート」の条件の違いは「ユーザーが違う」以外同じである必要があります。
以前のコードでは別のユーザーのツイートはMedia付きではありませんでした。ですが、今回新たにテストケースを作成したとき、テストケースの条件を整理できたからこそ、そこに気づけたわけです。

暗黙のテストケースは滅多に無いとは思いますが、存在する場合謎のコードとして表れてしまい、レビュワーやコードを読む人に疑問符を与えてしまうだけです。そのようなコードを撲滅するため **前提条件はすべてテストケースに記載する**ということを意識してみるといいと思います。
そうするとテストケースに現れない暗黙のテストが消えていき、**適切にテストケースが増えます**。

# テストケースの粒度は関心対象で分離しろ

旧：[テストケースの分割の粒度](https://blog.sa2taka.com/post/readable-test-code/#%E3%83%86%E3%82%B9%E3%83%88%E3%82%B1%E3%83%BC%E3%82%B9%E3%81%AE%E5%88%86%E5%89%B2%E3%81%AE%E7%B2%92%E5%BA%A6)

今回の `fetchTweetsWithMedia` ですが、単純な取得処理だけではなくて下記のような動作があるとしましょう。

- ツイートが取得されたことを保存する
- 対象のツイートの閲覧回数を増加させる

これはつまり、AAAで言うところのAssert・BDDで言うところのThenですよね。

`fetchTweetsWithMedia`メソッドがその責務を持っていることに対する是非はともかく、上記の動作なので、それもテストしたいですね。

そうなると下記になります。

```typescript:追加のテスト
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
        expect(tweets[0].viewsCount).toBe(1);
        // addViewTweetLogという関数が有り、ソレをjestの機能でモックしている。
        // モックされた関数は、toBeCalledWithなどで引数をテストできる
        expect(addViewTweetLog).toBeCalledWith(tweetWithMedia);
    });
```

問題はなさそうですが、itの説明文とあっていませんよね。itは「meida付きのツイートだけ取得できること」ですが、中身ではtweetの閲覧回数やログが吐かれていることを確認しています。これでは仕様とテストケースがあっておらず「*テストコードは仕様を表すこと*」に違反してしまいます。

ここで取るべきはit説明文を実際のコードに則して「media付きのツイートだけ取得でき、閲覧回数が増え、ログが吐かれること」とするか、テストケースを分割するかのどちらかです。

正直プログラマーであれば、全く同じ条件であれば、1つのテストケースに全部書きたい（またはbeforeEachなのに記載したい）と思いますが、テストケースを分割すると非常に読みやすくなります。

```typescript:テストケースを分割した場合
    it("media付のツイートだけ取得できること", async () => {
       ...
    });

    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
       ...
    });

    it("media付きのツイートを取得した際、対象のツイートが閲覧されたことをのログを吐くこと", async () => {
       ...
    });
```

「テストを書くこと」だけを目的にしたら上記は非常に冗長です。一方で上記にするメリットはあります。
1つは複数同じ処理を記載しなければならない点です。自然とArrange部分が見えてきて[AAAを意識して、コードを削減する](#AAAを意識して、コードを削減する)による共通化がしやすくなり、結果的にスッキリします。
もう1つは追加のテストケースの追加のしやすさです。既にテストケースが細かく分離されているため、新たな仕様が増えてもテストケースを増やすことに対する心理的なハードルはとても低いです。

一方でデメリットも有り、前提条件に大きな変更がある場合すべてのテストケースを修正する必要があります。これはDRY原則を破っているため表裏一体ですね。`fetch〜IntoStore` をイジることで対応できるのであれば問題ないですが、そうでない場合はすべてのテストケースを更新する必要があります。

正直しばらく前提条件が同じであればテストケースを1つにしていた時代があったのですが、経験則上テストケースが分離されていたほうが保守性が高いケースに多く出会っているため、今は関心対象ごとに分離しています。あくまで視点の1つとして参考にしてください。

# 起と結を明確にしろ

旧：[起と結を明確にしよう](https://blog.sa2taka.com/post/readable-test-code/#%E8%B5%B7%E3%81%A8%E7%B5%90%E3%82%92%E6%98%8E%E7%A2%BA%E3%81%AB%E3%81%97%E3%82%88%E3%81%86)

[テストケースの粒度は関心対象で分離しろ](#テストケースの粒度は関心対象で分離しろ)で記載したように、実は `fetchTweetsWithMedia` はTweetの閲覧回数を内部的に1増やしていました。そのことについてのテストケースが下記です。

```typescript:Tweetの閲覧回数が増えることを確認するテスト.ts
    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets[0].viewsCount).toBe(1);
    });
```

実はここに2つの暗黙的条件が記載されています。わかるでしょうか？

- `addTweetIntoStore` で作成したTweetの閲覧回数が0であることを前提としています
- `fetchTweetsWithMedia`で返ってくる値は「内部的にDBで更新した後の値と全く同じになる」ことを前提としています

前者はともかく、後者は少し分かりづらいですね。1つづつ見ていきましょう。

## 生成した値に前提する動作はやめよう

テストはAAAパターンで記載することは[AAAでテストを語れ](#AAAでテストを語れ)に記載しましたが、それぞれを単純に並べるのではなく、**一つのストーリーとして読み取れる状態になること**を意識しましょう。

今回は `tweet.viewsCount`が1つ増えることを確認していますよね。なのでストーリーとしては

- Arrange:`tweet.viewsCount` を0とします
- Act: `fetchTweetsWithMedia` を呼び出します（裏側で対象の`tweet.viewsCount`が1増えています）
- Assert: `tweet.viewsCount`が1であることを確認します

となります。今回のテストケースではこのArrangeに当たる「`tweet.viewsCount` を0とする」の記載が抜けています。初期値が1とかになった場合テストが落ちるようになってしまいます。テストが落ちるだけなのですぐに気付けるので大した問題にはなりませんが、より適切なコードになります。
そのためそれを改善すると下記のようになるでしょう。

```typescript:Tweetの閲覧回数の初期値が0であることを明示的にするテスト.ts
    ...
    const addTweetIntoStore = ({user, with}: {user: User, createProps?: Partial<Tweet>}): Promise<Tweet> => {
        const tweet = TestTweetFactory.build( { user, ...createProps });

        await TweetRepository.create(tweet);

        return tweet;
    }
    ...
    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, createProps: { mediaList: [media], viewsCount: 0 } });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets[0].viewsCount).toBe(1);
    });
```

`addTweetIntoStore` の引数 `createProps` が追加されました。これは`new Tweet` のときに渡される引数ですね。また、今まで`with`というパラメーター経由で渡してした`media`ですが、`createProps`によって`media`を渡せるようになったため消えましたね。

これにてArrangeとAssertの結びつきが明確になりました。もしかしたら上記のようなことが行えない場合があるかもしれません。そのようなときはコメントで補足してもいいとは思います。

```typescript:コメントで補足.ts
    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        // tweetWithMediaのviewsCountはデフォルトの値である0が設定されていることを前提としている
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets[0].viewsCount).toBe(1);
    });
```

下記のように、前提条件もテストのアサーションを利用して絞ることも考えられますが、アサーションは基本的にAssertの項目でのみ利用されるとするならばいい案とは言えないです。

```typescript:アサーションで動作を縛る.ts
    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        expect(tweetWithMedia.viewsCount).toBe(0);

        const tweets = await fetchTweetsWithMedia(user);

        expect(tweets[0].viewsCount).toBe(1);
    });
```

## 確認すべき値がどこにあるかを意識しよう

今回のテストケースで確認したいことは `viewsCount`が増えることですよね。なのでテストでは ` expect(tweets[0].viewsCount).toBe(1);` として確認しています。でもこの `tweets[0]`ってどこからやってきた値ですか？ `fetchTweetsWithMedia`の戻り値ですよね。貴方（このテストを書いた人）が本来意図しているのって`fetchTweetsWithMedia`の戻り値の`viewsCount`が増えていることなのでしょうか？　おそらく違います。本来の意図は、DB上のツイートの`viewsCount`が増えていることでしょう（DB上にの`viewsCount`というカラムがあることを前提としています）。

すなわち**本当に確認すべき場所がどこなのかを気にする必要**があります。
今回のケースに置いては、実装的には同じ意味だし細かい違いじゃん、と思うかもしれません。ただしDBに保存し忘れるとか、JavaScriptだと非同期処理に`await`をつけ忘れることでしばしば大変になることもあり、そういったミスを防ぐためにもできる限り本来どこの場所がどうなっていないといけないかを記載します。

```typescript:Tweetの閲覧回数の初期値が0であることを明示的にするテスト.ts
    it("media付きのツイートを取得した際、DB上の対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, createProps: { mediaList: [media], viewsCount: 0 } });
        await addTweetIntoStore({ user: targetUser })

        await fetchTweetsWithMedia(user);

        const updatedTweet = await TweetRepository.find(tweetWithMedia.id);    
        expect(updatedTweet?.viewsCount).toBe(1);
    });
```

修正するに当たり、itの説明文にも`DB上の`というのをつけました。もちろん明示していなくてもなんとなくDB上の値が更新されるんだろうなぁと想像はできますが、テストケースがより仕様に寄り添いましたね。

こちらは読みやすいテストコード、というよりもむしろ間違いづらいテストコードではありますが、結果的に読みやすさにも繋がります。正しいコードはいつだって正しくないコードよりは読みやすいですからね。


# 諸刃の剣のRandomly

旧：[諸刃の剣のRandomly](https://blog.sa2taka.com/post/readable-test-code/#%E8%AB%B8%E5%88%83%E3%81%AE%E5%89%A3%E3%81%AERandomly)

この章は読みやすさというよりも、正しいテストコード・テストケースとはなんだろうかという観点で記載しています。

[faker.js](https://fakerjs.dev/)はJavaScript用のライブラリで、テストで使えるランダムな値を生成できるものです。
これを活用すれば、特定の値に依存しない強固なテストが記載できます。乱用すると若干読みづらい気もしますが、僕は気にせず乱用しています。これは「*テストコードは可能な限り動作環境と同じであること*」を達成できます。つまり、テスト用の固定の値ではなく、可能な限りランダムな値で、特定のケースで死ぬケースを防ぐことができます。しかしながら、ランダムな値は用法を間違えるとflaky testとして跳ね返ります。

flakyテストは完全に悪ではありません。Fuzzingテストのように想定外の事象に気付ける場合もあります。例えば任意の文字列をIDとして登録できるシステムがあります。ですが、このIDが実は`/`を使えない仕様があり、それに気づかずにバリデーションを設定せずに行っていて、ランダムな入力で`/`が含まれる場合にエラーが発生するというflaky testが発生します。これは仕様漏れに気付けるチャンスが増えたと喜ぶべきことかもしれません。

それでも無駄なflaky Testは結構面倒くさいので避けたいです。PR作ってテストが落ちて、確認したら全く触っていない知らないテストだったときの辛さは計り知れないものがあります。

例えば下記のようなテストがあります。凄まじく単純なテストで、画像付きのツイートを作成する部分のテストです。

```typescript:ツイート作成のテスト.ts
describe("createTweet", () => {
    ...
    it("メディアがついている場合、ツイートの他にメディアも作成できること", async () => {
        // 下記はランダムに0〜4までの数字を作るもの。メディアは最大4枚なので4としている
        const mediaCount = faker.datatype.number(4);

        // JavaScript知らない人向けに説明するが、Array(num).fill()は要素num個のデータを作成するおまじない
        // なので、下記はランダムの数字個の画像URLを作成している
        const mediaList = Array(mediaCount).fill().map(() => faker.image.imageUrl());
        const createProps = { content: faker.datatype.string(), mediaList };

        const createResult = await createTweet(createProps);

        const tweet = TweetRepository.find(createResult.id);
        const createdMediaList = MediaRepository.findByTweetId(createResult.id);

        expect(createdMediaList.length).toBe(mediaCount);
        // その他createdMediaListの中身を確認するAssert
    });
});
```

さてと、上記コードをコミットしてPR作成。OK、テスト通ったぞ。レビューも通ったぞ。マージされたぞ。
それから一週間後、急に不可解にテストが落ちるようになりました。特に考えずにRerunするとテストが通るので気にしていなかったが、頻度がそこそこあるためちゃんと見てみる。落ちているテストは `createTweet > メディアがついている場合、ツイートの他にメディアも作成できること`。なるほど、7日前に俺が作ったコードだな。

上記のテストを追加してから一週間後、何があったのでしょうか。具体的には下記のテストが追加されました。

```typescript:一週間後のツイート作成のテスト.ts
describe("createTweet", () => {
    ...
    it("引数のmediaListが空の場合、エラーになること", async () => {
        const tweetProps = { content: faker.datatype.string() };
        // 下記は非同期の関数に対して、指定したエラーがthrowされたかどうかを確認するテストです
        await expect(() => createTweet({...tweetProps, mediaList: []})).rejects.toThrowError(new EmptyMediaListError());
    });
});
```

上記のテスト自体は問題では有りません。上記のテストが追加されているということは`mediaList`が空になる場合エラーになるというコードが入ったわけですね。

では、落ちるようになったテストを再掲してみましょう。

```typescript:ツイート作成のテスト.ts
describe("createTweet", () => {
    ...
    it("メディアがついている場合、ツイートの他にメディアも作成できること", async () => {
        // 下記はランダムに0〜4までの数字を作るもの。メディアは最大4枚なので4としている
        const mediaCount = faker.datatype.number(4);

        // JavaScript知らない人向けに説明するが、Array(num).fill()は要素num個のデータを作成するおまじない
        // なので、下記はランダムの数字個の画像URLを作成している
        const mediaList = Array(mediaCount).fill().map(() => faker.image.imageUrl());
        const createProps = { content: faker.datatype.string(), mediaList };

        const createResult = await createTweet(createProps);

        const tweet = TweetRepository.find(createResult.id);
        const createdMediaList = MediaRepository.findByTweetId(createResult.id);

        expect(createdMediaList.length).toBe(mediaCount);
        // その他createdMediaListの中身を確認するAssert
    });
});
```

大事なのは `mediaCount` です。説明のためにコメントを書いていますが、そのコメントは

> // 下記はランダムに0〜4までの数字を作るもの。メディアは最大4枚なので4としている

と書いています。つまりランダムに選ばれるため、1/5の確率で「0」が選ばれます。ということは1/5の確率で上記のテストは`createTweet`がエラーになりテストが通らなくなります。

上記のように仕様変更でエラーになるようになったり、0が入るとだめなのに、うっかり0がランダムに入ってしまうようなランダム値の生成を使うなどうっかり入れてしまうケースもあります。上記のケースは以下のどれかに修正すれば良さそうですね。

- 1や4などの数値に固定する
- ランダムな範囲を1〜4にする。fakerを使うのであれば`faker.datatype.number({min: 1, max: 4})`とすればよい
- そもそも取りうる数は1〜4なので、全てに対してテストケースを追加する。jestであれば`it.each`などが利用できる

もちろんfakerを始めとしたランダムな値を利用すると、思いかげないエラーを見つけることができることもあります。しかし、上記のような場合もあるので利用する際は気をつけましょう。

個人的にはfakerを使う箇所のルールは3つあります。

1つ目は、Aを入力したらAが返ってくる場所。例えばツイートを作成したら、ツイートが保存されていることを確認する際の、ツイート内容である`content`はfakerで作成します。何らかの固定値でも良いのですが「ここはなんの値が入っても基本的にはいいよ」という意図を表しています。ただしツイートの文字数は140文字制限（英語だと280字）ですが、その制限をテストする場合はまた別です。

2つ目は、該当の項目が様々な入力を受けつけられるが、特定の条件がある場合にはランダム生成の条件をちゃんと記載してあげることです。
例えば上記の例では、1〜4個のメディアという範囲があるのでちゃんと「1〜4」を指定してあげました。
しかしながら、これはテストの基本中の基本である境界値のテストをしてあげたほうがいいでしょう。もちろんランダムな個数のテストはあってもいいですが、それに加えて「0個の場合（これは上記のテストの「引数のmediaListが空の場合、エラーになること」のテスト）」、「1個の場合」「4個の場合」「5個の場合（エラー）」を確認するべきです。
そのため、特定の条件がある場合に、わざわざfakerを使ってデータを作成するのはあまり得策ではなく、何らかの理由がなければランダムな値は使わないほうがいいでしょう。

3つ目は、特定の値の制約があるが、前提条件的には何でもいい場合。
例えば上記の例で、「Mediaの`type`には`image`と`movie`に二通りがある場合」というケース。こういう場合は、fakerで適当に値を埋めています。

1つ目と3つ目は固定の値でも良いのですが、何らかのデグレや仕様漏れに来づけるチャンスを増やすためにそうしています。

# モックの使い所

「*テストコードは可能な限り動作環境と同じであること*」という方針を建てているため、この記事の前提としてモックが少ないことを暗に含んでこの話は展開しています。

モックというのは、上記でも少し記載しましたが、ロンドン派（モック多め）とデトロイト派（モック少なめ）というような物があるほどに非常に深い話ではあります。
私は前者、モックが少ないほうが正義であるという立場ですので、その立場で話します。

モックの使い所ですが個人的に基本として1箇所、例外として1箇所定義してます。

基本の1つは、「*テストコードは可能な限り動作環境と同じであること*」から導き出されるのですが、すなわち「**動作環境と同じものを用意するのが不可能な場合**」です。ここにさらに例外があるのですが、そういった場合でもエミュレーターが存在する場合があります。例えば私はGCPのCloud Storageを利用していますが、これのエミュレーターがあるので、エミュレーターを利用してテストしています。これもモックの延長線といえばそれまでですが、少なくとも言語やライブラリのモックとは別のものです。

例えば、`hasNoSocialProblem`という関数ではTweetの内容やメディアの内容が問題がないかチェックをする処理があります。そのうちMediaのチェック機能は外部のAPIを呼んでいます。環境を用意できないため、このAPIの部分はモックを作成します。`hasNoSocialProblem`のテストは下記のようになります。

```typescript:has-no-social-problem.test.ts
jest.mock("src/externals/request-media-checker")
describe("hasNoSocialProblem", () => {
  beforeEach(() => {
    // jestでは下記のようにすればモックの挙動を制御できます
    (requestMediaChecker as jest.Mock).mockResolved({ result: "ok", reason: null });
  });

  it("禁止ワードが含まれていたら例外を吐く", async () => {
    ...
  })

  it("MediaCheckerへリクエストを送ること", async () => {
    ...
    expect(requestMediaChecker).toHaveBeenCalled();
  })

  it("MediaCheckerのresultがngの場合例外を吐く", async () => {
     (requestMediaChecker as jest.Mock).mockResolved({ result: "ng", reason: "..." });
  })
});
```

モックを利用する例外の部分ですが「**前提条件の用意が面倒かつ呼ばれること自体に意味があること**」です。

例えば`hasNoSocialProblem`は様々なDBのマスタデータが必要で、前提条件を作るのが面倒だったとします。前提条件を作る共通処理を作成すれば全然良いとは思いますが、`createTweet`では正直`hasNoSocialProblem`を呼び出していることさえ確認できれば細かい点を確認する必要はないので、例外的に使ってもいいかなと感じます。

```typescript:hasNoSocialProblemをモックする部分
jest.mock("src/has-no-social-problem")
describe("createTweet", () => {
  beforeEach(() => {
    (hasNoSocialProblem as jest.Mock).mockResolved(true);
  });

  ...

  it("hasNoSocialProblemがtrueだったら保存する", async () => {
    ...
  })

  it("hasNoSocialProblemがfalseだったら保存しない", async () => {
    ...
  })
});
```

## 依存関係の部分のテスト範囲

結合テスト（Sociable Unit Tests）のテストですが、モックを使わない場合どこまで依存関係を深堀っててテストをするんだ、という疑問が存在します。

基本的には「大きく深堀ってテストをする必要がない」と思っています。一方で「その対象の責務であればテストをした方がよい」とも思っています。これはだいぶ明確なルールがなく勘や経験則に基づいている部分です。

「大きく深堀ってテストする必要がない」ということですが、どういうことでしょうか。[モックの使い所](#モックの使い所)で出た、`createTweet` と `hasNoSocialProblem` の関係を考えてみましょう。上記ではモックされてしまいましたが、モックせずに`hasNoSocialProblem`を呼び出せると考えましょう。

例として4つ挙げてみます。次の4つの内、どれがいいでしょうか？


```typescript:1_呼ばれることだけ確認する
// 先ほどと異なるのは、`mockResolved` が呼ばれていないため、処理自体はちゃんと動いている
// 呼ばれているかどうだけをテストできるようになっている
jest.mock("src/has-no-social-problem");
describe("createTweet", () => {
 
  ...

  it("hasNoSocialProblemを呼ぶこと", async () => {
    ...
  })
});
```

```typescript:2_hasNoSocialProblemのテストケースを網羅している
describe("createTweet", () => {
  it("禁止ワードが含まれている場合保存しない", async () => {
    ...
  })

  it("MediaCheckerがngを返したら保存しない", async () => {
    ...
  })
});
```

```typescript:3_hasNoSocialProblemが動いていそうなことだけは確認する
describe("createTweet", () => {
  it("hasNoSocialProblemでfalseになる場合保存しないこと", async () => {
    // モックを使わずにfalseになるような前提条件を作成する
    // 例えばツイート内容に禁止ワードを入れるとか
    ...
  })
});
```

```typescript:4_何も確認しない
describe("createTweet", () => {
  ...
});
```

「*テストコードは仕様を表すこと*」を考えると4は論外です。2がいいように感じますが、これはこれで`hasNoSocialProblem`側に仕様が増えたらこちら側にも増やす必要があります。これでは「*テストコードはテストケースを追加しやすいこと*」が怪しいですね。
個人的には3を選びます。代表っぽい処理を確認して、動作することを確認します。1も悪くないですが、1の場合結果がどう使われるかがテストから読み取れません。例えばtrueの場合誤って保存しないようになっていても気づけませんし、falseで誤って保存していても同じ用に気づけません。

「その対象の責務であればテストをした方がよい」というのはどういうことでしょうか？これは、特定の処理をSLAP原則に従ったりして分離した際などを想定しています。
例えば、ツイートに`@〜`がある場合その部分のIDを持つアカウントを引っ張ってきて、その部分をユーザーのホームへのリンクに置き換える処理があるとします。コードは下記のようになっているとします。

```typescript:replaceReply
export const replaceReply = async (content: string): Promise<string> {
  const { userIds, replyLocation } = extractReply(content);
  const users = await UserRepository.findByIds(usersIds);
  return embedReplyLink({ content, replyLocation, users });
}
```

`findByIds` はともかくとして`extractReply`と`embedReplyLink`はそれぞれ詳細な単体テストが記載されています。
`replaceReply`のテストケースに`extractReply`や`embedReplyLink`のテストケースも含めて仕様を網羅させるか、という話です。
個人的にはこの場合も時と場合次第かなと思います。`replaceReply` が気にするべきケースであれば記載するべきだし、そうでない例えば事実上ほぼありえないようなレアケースとかはそれぞれの単体テストでカバーできれば良い、という意見です。追加しすぎると負荷があるし、しなさすぎると仕様を網羅できないというトレードオフの関係かなと思っています。

# 生成AIを味方につけろ

Github CopilotやCursorはプログラマーの間ではもう既に市民権を得ているでしょう。私もかなり活用していますが、特にテストにおいてはほとんどがCopilotが生成するケースさえあります。

最近はCopilotが上手く書けるようにテストを書くことも1つ指標として取り入れています。
ゴールとしては、すべてのテストケースの説明文と1つのテストケースを記載すればあとはすべてCopilotが中身を埋めてくれることです。基本的に100%あっていることはないですが、前提条件を少し修正・確認事項を少し修正で正しいになる場合がほとんどです。これは前提条件の記述量が多いコードで特に力を発揮します。一方でAIは疲れ知らず。前提条件が多くてもぱぱっと全部記載できることもあるため、前提条件を短くするという気概を失う可能性もあります。

生成AIが適切にコードを生成するために、経験則的に下記を行うとより適切になります。

- テストケースの説明は詳細に行う
- テストケースの粒度は、関心対象で分離する
     - 上と表裏一体かもしれません
     - テストケースの説明を詳細に行うためには、確認対象をテストケースに含める必要があるため、自然と粒度が小さくなっていきます
- 前提条件の生成関数を適切に作る

**Copilotが読みやすいコードというのは、人間も読みやすいコードと考えています。**

テストケースの説明が適当、例えば「適切に結果を返すこと」とかだと、当然Copilotはテスト生成の精度が低くなります。一方で「禁止ワードが含まれていたらfalse」を返すだと精度は高くなりますし、「禁止ワードDBに登録されているワードが含まれている場合falseを返す」だとより精度は高くなります。これは人間にとってもテストケースの説明だけで動作の想像が多分にできるため良いです。最後の例だとくどいため、真ん中の例に留めるケースは大いに有り得るとは思います。
更に、テストケースの説明を練度を上げるためには、ArrangeやAssert（GivenやThen）もテストケースの説明に可能な限り含まれる必要があります。説明文が長くなるを避けるには、適切にテストケースを分離する必要があります。もちろんテストケースを関心対象ごとに分離すれば良くなります。私自身は`describe`に該当する機能はあんまり使わないですが、前提条件が長すぎる・1つの前提条件の場合に確認する事項が多すぎる場合は、describeに前提条件を押し込めて説明文を短くすることを行っています。

Copilotのためにコメントを多用することはやっていません。人間にも必要なコメントであれば振りますが、前提条件などをわざわざ自然言語で明示するのは不要な場合があると感じているためです。
ただ、下記のような生成AI前提のテストモジュールなんかがあっても面白いかなと思っています（もうちょいいいインターフェースあると思いますが）。こう思うとRSpecの`let`とか`subject`とかは割とAIとの相性が良さそうですよね。

```typescript
it(
    {
        given: `
            - 禁止ワードDBにランダムなワードを登録する
            - ランダムなワードを含む文字列を生成する
        `,
        when: `
            - 生成した文字列をhasBannedWordメソッドに渡す
        `,
        then: `
            - trueを返す
        `,
    }
, () => {...})
```

前提条件の関数を上手く作ると、よりCopilotの精度が上がります。経験則的に上手くいくというものでありちゃんとした言語化はできていないですが下記の要素があると良いのかなと思います。

- テストに不必要なプロパティがテストケース内に表れない
- テストに必要なプロパティがわかりやすく登場する

例えば、上記で出てきた`Tweet`のモデルを前提条件にする場合です。下記は前提条件のコードが長くなってしまい、結果的にCopilotが誤った生成をする可能性もあるケースです。

```typescript:避けたほうが良いパターン
it("Media付きツイートを取得できること", () => {
    const user = new User({
        identifier: "testUser",
        name: "testUser",
    })
    const media = new Media({
        url: faker.image.imageUrl(),
    })
    const tweetWithMedia = new Tweet({
        user,
        content: "tweet",
        mediaList: [media],
        createdAt: new Date(),
    });
    const tweetWithoutMedia = new Tweet({
        user,
        content: "tweet",
        createdAt: new Date(),
    })

    ...
})
```

上記ですが、Copilot以前にいくつか良くない点があります。というのも、今回のテストで必要な前提条件が（テストケースと変数名からなんとなく読み取れますが）分かりづらいためです。その理由はuserは`identifier`と`name`がないとエラーになるし、tweetも`content`と`createdAt`がないとエラーになってしまう、みたいなテストと関係ない仕様が入り込んでしまっています。上記のテストでは「media付きであれば取れる・そうでなければ取れない」ということであり、下記のような記載のほうが読み取りやすいでしょう。


```typescript:必要な前提条件のみに絞る
it("Media付きツイートを取得できること", () => {
    const user = TestUserFactory.build();
    const media = TestMediaFactory.build();
    const tweetWithMedia = TestTweetFactory.build({ user, mediaList: [media] })
    const tweetWithoutMedia = TestTweetFactory.build({ user });

    ...
})
```

最初からしれっと`Factory`というのを出していますが、これはRubyでいうFactoryBotです。TypeScriptでは[fishery](https://github.com/thoughtbot/fishery)というライブラリがあります。テスト用に適当に値を埋めて生成してくれるライブラリですね。
これを使えば、テストに関係のあるパラメーターのみを明示的ができます。userには`identifier`が必要とかtweetには`content`が必要などの別の仕様をFactoryに押し込めることができるため、前提条件がよりクリアになります。

このようにアプローチすると、より高い精度でCopilotが生成してくれるようになります。また結果的に人間にも読みやすいコードになっているのではと思っています。Copilotがテストケースを生成してくれるともちろん生産性は上がります。個人的な感覚ですが、テストのコストが低くなるためテストケースを増やすことに対する不安がなくなります。その結果テストケース（私にとっては仕様ですが）の正しさを考えることができ、よりよいテストを書けると思います。

# まとめ

改めて、テストを書く際の考えをまとめてみました。

方針は3つ。

- ***テストコードは仕様を表すこと。***
- ***テストコードはテストケースを追加しやすいこと。***
- ***テストコードは可能な限り動作環境と同じであること。ただしコストは低いこと。***

そして、方法論としては下記のようなものが挙げられます。

- コードはテストケースを満たすために書くものだ。
    - 仕様駆動テスト。仕様をテストケースに落としこむところから始める。
    - 仕様・テストケースが絶対というわけじゃない。最終的な目的を見失わない。
- テストケースのすべてをテストケースの中だけ読めば分かる状態にする。
    - beforeEachやbeforeAllなどに共通なオブジェクトなどをまとめて置きたい気持ちを抑える。
    - テストケースなんて冗長すぎるぐらいでいいという気持ちを持つ。
- AAA(Arrange・Act・Assert)を意識する。
    - 「どういうときに」「何をやったら」「どうなる」というストーリーにする。
    - とくにArrangeはコード量が多くなり、冗長になりがちで、まとめたくなってしまう。
    - まとめるときは後に記載する起と結のストーリーを上手く描けるように、準備用の関数などに切り出し「何をやっているか」というニュアンスがテストケースに残るようにする。
- 暗黙的なテストが入り込む余地を消そう。
    - 暗黙的に考えているテストケースがある場合は、それを明示的にする。
    - そのためには共通のオブジェクトを排除すると見えることがある。
- テストケースの粒度は、関心対象で分離しよう。
    - テストケース1つでは、テストの対象が「何をやっているか」1つのみを確認するようにしよう。
    - テストの対象が複数のことをやることはざらにあるが、それらを分割しよう。
- 起と結を明確にする。
    - 確認するべき事柄が、最初どういう状態だったかを明示しよう。つまりAssertで確認する対象は可能な限りArrangeでどういう状態なのかを規定しよう。
    - Assertで確認する値が、本来はどの値なのかを見極めよう。特に対象の戻り値なのかDBに保存されている（更新された）値なのかは注意しよう。
- ランダムな値が利用できる箇所を考える。
    - ランダムな値は使い所によっては毒にも薬にもなる。
    - 特定の条件を表すためにランダムな値を利用するときはflakyなテストにならない用に気をつける。境界値テストとかのほうがベストなケースがほとんどだぞ。
- モックは無いなら無いほうがいい。
    - モック自身が便利な機能なので、地獄の沙汰もエンジニアの腕次第。
    - モック以外にも言えるが、負荷と仕様の網羅性とのトレードオフを考えること。
    - 依存が深い時のテスト範囲は「対象の処理が気にするべき仕様かどうか」・「テストケースの網羅性」・「テストケースのメンテナンス性」から適切に範囲を決めよう。
- 生成AIを活用してテストを素早く書こう。
    - 生成AIが使えるなら、テストコードを書くコストは減る。
    - 活用するためには上記に上げた方法論は有効。またテストケースを正しく書くチャンスにもなり、結果的に人間にも優しいコードになる。 

また2年後振り返ってみます。
