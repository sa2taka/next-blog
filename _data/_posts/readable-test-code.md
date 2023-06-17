---
layout:      post
title:       読みやすいコードとテストコードは評価軸が違う 〜 読みやすいテストコードのために心がけること
author:      sa2taka
category:    poem
tags:        test,jest,TypeScript
public:      true
createdAt:   2022-09-18
updatedAt:   2023-06-18
latex:       false
description:
  自分なりに読みやすいテストコードとはなんだろう、自分がテストを書くときに心がけていることはなんだろうか、その点について記載しました。  
---

趣味のプログラミングならともかく、本番のコード、特にビジネスロジックに関わる場所の単体テストはなくてはならない存在です。

私自身、前職では会社でコードを書いていなかったのもありますが、テストをちゃんと書くようになったのはここ一年のことではあります。
そんな一年の中に、テストコードの読みやすさについて考えると。いくつか自分流ではありますがルールが存在することに気づいたので、本記事ではそれをまとめてみます。

# はじめに

私自身は読みやすいテストコード、みたいな文脈で本や文章はほとんど読んだこと無いため（リーダブルコードはある）、実はアンチパターンだったり、実は常識でした、みたいな場面もあるかもしれません。

ただ、転職してすぐあたりに [Rails Developers Meetup 2019で、再び綺麗なテストコードの書き方について発表した - おもしろwebサービス開発日記](https://blog.willnet.in/entry/2019/03/27/092642)という資料を紹介いただき、ここに書いてあるエッセンスはかなり受け継いでいる節があります。上記資料はRubyやRSpecというかなり弾けた（）言語を利用しているのですべての言語に対して同じと言えない部分もあるかもしれませんが、素晴らしい資料です。

本記事ではTypeScript及びJestを利用していますが、癖のある部分は利用せず、どちらも一般的に他の言語にもある程度のコードを記載していきます。また、コードやテストコードの正しさは確認しておらずビルドエラーや実行時エラーになる可能性もありますので、ニュアンスが伝われば幸いです。

# テストコードにおけるDRYは善でも悪でもない

この記事を書く際にいくつか読みやすさについて書かれている記事をあさりましたが、これに類推することを様々な人が示唆しています（DRYは良くないというのもある）。

一般的に、プログラミングにおいてDRY、Do not Repeat Yourself原則は数あるプログラミングパラダイムでも中心的な1つです。意味としては「重複する要素（概念とかドメインとか）は厳禁」という意味で、「コードの重複をするな」というわけではないですが、重複するコードはしばしば嫌われます。

しかしながら、テストコードではやりすぎたDRYは禁物です。この場合はDRYというよりも[OAOO原則](https://wa3.i-3-i.info/word12001.html)かもしれませんが、似たようなコードをまとめることがむしろ読みづらさの原因になることがあります。

下記のようなテストを考えてみます。下記は、Twitterのような短文投稿サイトの中にあるテストです。対象のユーザーが画像つきで投稿したツイートを取得する関数 `fetchTweetWithMedia` のテストケースのようですね。

```typescript:改善前のコード.ts
describe("fetchTweetWithMedia", () => {
    // faker は javascript のテスト用データ生成ライブラリです。javascript以外にも同名で似たような機能のライブラリがあります
    const user1 = new User({id: faker.datatype.uuid()});
    const user2 = new User({id: faker.datatype.uuid()});

    const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user1 })
    const media = new Media({ mediaUrl: faker.image.imageUrl() })
    const tweetWithMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), media, user: user1 })
    const otherUserTweet = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16) user: user2 })

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
        const tweets = await fetchTweetWithMedia(user1);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const tweets = await fetchTweetWithMedia(user1);

        // 下記はtweetWithoutMediaが配列内に存在しないことを確認するコード
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
});
```

テストコードも書いたこと無いし、DRY(OAOO)を強く意識していた私はこんな感じのコードを書いていました。

一件 `it` の中身は単純なのでまだ読みやすそうですが、結構脳内メモリを食います。
私がテストコードをレビューするときは「describeの文章」=>describeがitが出るまで読まない=>「describeまたはitの文章」=>itの場合は中身を読む、という順番で読んでいるので、正直describeとitの間の中にafterEachなどの後片付け処理以外が色々書かれているとそこそこやる気が削がれます。
これは私の問題ではありますが、どういったところが脳内メモリを持っていかれるのか見ていきましょう。

おそらくテストを記載した人は前処理をすべて一箇所、具体的に言えば `beforeAll` とその直前にまとめたかったのだと思います。
では、そこで `it` の中だけを読んでみましょう。

```typescript:改善前のコード(抜粋).ts
    it("media付のツイートだけ取得できること", async () => {
        const tweets = await fetchTweetWithMedia(user1); // <-- user1って誰?

        expect(tweets).toEqual([tweetWithMedia]); // <-- tweetWithMedia、多分media付きのツイートなんだろうな
        // <-- あれ、tweetWithMediaってuser1が呟いていたものだっけ?
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const tweets = await fetchTweetWithMedia(user1); // <-- user1って誰? あ、さっきも出たな

        // 下記はtweetWithoutMediaが配列内に存在することを確認するコード
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia])); // <-- tweetWithoutMedia、多分mediaついてないんだろうな
        // <-- あれ、こいつもuser1が呟いたものなんだよな?
    });
```

コメントに記載した `<--` で記載したところは、 `it` の中だけを読んだ人の確認する事項です。6箇所の確認事項があります。もちろん`beforeAll` やその直前をちゃんと読んで、前提条件を完全に理解して読み進めれば確認事項は少ないですが、定義場所と距離が有りすぎます。

私も正直、変数名からの予想や「〜なんだし〜は自明だろう」と信じて書き進め・読み進めてしまうタイプなので、テストを記載する場合上記のような記載をしてしまう可能性もありますが、あまり読者（レビュワー・このテストを参考にする人・明日の貴方）に優しくないです。上記のテストはまだ100行にも満たないですが、数100行に渡る場合、単純に行ったり来たりで面倒くさいです。

正直テストコードの行数が増えるぐらいなら**前提条件は `it` の中に押し込めるほうがベスト**です。具体的な理由は[AAAを意識して、コードを削減する](#AAAを意識して、コードを削減する)に記載していますが、合理的な理由の1つとして、テストケースと前提条件との物理的な距離が遠くなるのを防げます。

```typescript:テストケースの中にすべてまとめたコード.ts
describe("fetchTweetWithMedia", () => {
    const user2 = new User({id: faker.datatype.uuid()});
    const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16) user: user2 })

    beforeAll(async () => {
        await UserRepository.create(user2);
        await TweetRepository.create(otherUserTweet);
    });

    it("media付のツイートだけ取得できること", async () => {
        const user = new User({id: faker.datatype.uuid()});
        const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user })
        const media = new Media({ mediaUrl: faker.image.imageUrl() })
        const tweetWithMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), media, user: user });

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const user = new User({id: faker.datatype.uuid()});
        const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user1 })
        const media = new Media({ mediaUrl: faker.image.imageUrl() })
        const tweetWithMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), media, user: user1 })

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        const tweets = await fetchTweetWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
});
```

正直行数は倍になりましたが、 `it` の中にすべてが記載されるようになりました。

```typescript:テストケースの中にすべて突っ込んだコード(抜粋).ts
    it("media付のツイートだけ取得できること", async () => {
        const user = new User({id: faker.datatype.uuid()});
        const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user })
        const media = new Media({ mediaUrl: faker.image.imageUrl() })
        const tweetWithMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), media, user: user });

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });
```

**テストコードの目的は短いテストを書くことではなく、シンプルに読みやすいテストを書くことです**。

:::info
言語やテストライブラリによってベストプラクティスや普遍的に利用されているテストのパターン、使える機能などが異なるため、共通化が常識な場合もあります。
Rubyの有名なテストライブラリの1つであるRSpecを例にしましょう。今回のテストケースはコードは下記のような記載がされると思います（RSpecあんまり書いたこと無いので嘘かもしれません）。

```ruby:RSpecで書き直したコード
RSpec.describe "fetchTweetWithMedia" do
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

        subject { fetchTweetWithMedia }

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

# AAAまたはGiven-When-Thenをテストケースに押し込もう

テストケースには **AAAパターン**と呼ばれるパターンがあります。これは

- Arrange（用意する）: 前提条件と入力を用意する
- Act（実行する）: テスト対象のコードを実行する
- Assert（表明する）: 期待されるべき出力を表明する

の頭文字です。他にAssemble-Activate-Assertという語を利用する場合もありますが、いずれも同じ意味です。
またBDD(Behavior Driven Depelepment)ではGiven-When-Thenというシナリオパターンを利用しますが、そのような考え方がテストでは重要です。

簡単に言えば「これこれこういう条件の場合」「これをやったら」「こうなる」というのがテストの本質であり、この順番にテストを書きましょうね、ということです。

先程のテストケースをAAAの3つに分割すると下記のようになります。

```typescript:AAAに分割したテストケース.ts
    it("media付のツイートだけ取得できること", async () => {
        // Arrange
        const user = new User({id: faker.datatype.uuid()});
        const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user })
        const media = new Media({ mediaUrl: faker.image.imageUrl() })
        const tweetWithMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), media, user: user });

        await UserRepository.create(user);
        await MediaRepository.create(media);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);

        // Act
        const tweets = await fetchTweetWithMedia(user);

        // Assert
        expect(tweets).toEqual([tweetWithMedia]);
    });
```

## AAAを意識して、コードを削減する

経験則として、基本Arrangeがテストコードをほとんど圧迫します。なので、`beforeAll` などの処理にこのArrangeが記載されていることがあります[^assert]。

[^assert]: ちなみに、時々Assertが圧迫することもありますが、それらが`afterEach`（jestにおいて、テストケースの実行後に都度実行される処理）などに入っているのは多分無いと思います。Assertが圧迫する場合は、テストケースを分離するか、複数のAssertをまとめて1つの関数にする方法がおすすめです。具体的なlintハックですが、eslintを利用している場a合テストケースの中に`exepct`関数がない場合、エラーやwarningになる場合があります。それを回避するテクニックとしてファイル先頭に `/* eslint jest/expect-expect: ["warning", { "assertFunctionNames": ["expectをまとめた関数名"] }] */`を記載するという方法があります。詳細は[lintの説明](https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/expect-expect.md)を参照のこと。

私はbeforeAllを始めとして「すべてのテストケースで利用するオブジェクトの共通化」には賛成ではありません。
もちろん変数の定義箇所と利用箇所の物理的距離が離れる・他のテストケースで対象のオブジェクトが変更される可能性があるなど直接的な要因もありますが、どちらかというと概念的に **「テストケースには必ず条件・テスト対象・期待される出力や動作」が記載されているべき** と考えているからです。

というのも、共通化されたオブジェクトはそれぞれ「**どのテストケースの前提条件なのか一切わからない**」ためです。
改善前の最初のテストコードを見てみましょう。

```typescript: 改善前のコード.ts
describe("fetchTweetWithMedia", () => {
    const user1 = new User({id: faker.datatype.uuid()});
    const user2 = new User({id: faker.datatype.uuid()});

    const tweetWithoutMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user1 })
    const media = new Media({ mediaUrl: faker.image.imageUrl() })
    const tweetWithMedia = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), media, user: user1 })
    const otherUserTweet = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16) user: user2 })

    // beforeAll は jest の機能の一つであり、同じスコープ以下のテストケース全体の前に一度だけ実行するものです一度だけ実行するものです
    beforeAll(async () => {
        await UserRepository.create(user1);
        await UserRepository.create(user2);
        await TweetRepository.create(tweetWithoutMedia);
        await TweetRepository.create(tweetWithMedia);
        await TweetRepository.create(otherUserTweet);
        await MediaRepository.create(media);
    });

    it("media付のツイートだけ取得できること", async () => {
        ...
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        ...
    });
});
```

`user1`ってどこで使っているの？　すべてのテストケース？　一部のテストケース？ `tweetWithoutMedia`は？　テストケースが2つしかないのでまだ全部見ればいいだけですが、10個あったら僕の持病の頭痛が5倍の痛みになります。

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
// JavaScriptを知らない人のために記載しますが async () => ...は非同期処理であることを表しています。戻り値は Promise という非同期の為の型になります。
// await addUserIntoStore(); という感じにすると同期的に実行しているように見えますので、普通のプログラムと同じ感じに読んでいただいて大丈夫です
const addUserIntoStore = async (): Promise<User> => {
    const user = new User({ id: faker.datatype.uuid() });

    await UserRepository.create(user);

    return user;
}

const addMediaIntoStore = (): Promise<Media> => {
    const media = new Media({  mediaUrl: faker.image.imageUrl() });

    await MediaRepository.create(media);

    return media;
}

// TypeScriptを知らない方のために説明しますが、 with? という末尾にある?は、対象のパラメーターが必須ではないことを表します。なので {user: new User()}でも{user: new User(), with: new Media()}のどちらでもOKです。
const addTweetIntoStore = ({user, with}: {user: User, with?: Media}): Promise<Tweet> {
        const tweet = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user, media: with })

    await TweetRepository.create(tweet);

    return tweet;
}

...

    it("media付のツイートだけ取得できること", async () => {
        // Arrange
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        // Act
        const tweets = await fetchTweetWithMedia(user);

        // Assert
        expect(tweets).toEqual([tweetWithMedia]);
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

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
```

また `beforeAll` などitの外に記載する共通化と大きく異なるのは, itの中にAAA、特にArrangeが記載されることです。そのため、itの説明文を読み・前提条件を読み・何を行っているかを読み・何を検証しているのかを読むという、上から下にただ読むだけでよくなります。

# 人はテストケースの説明だけしか読まない

現在のテストコード全体を見てみましょう。いくつか疑問が生まれるかもしれません。

```typescript:改善中のテストコード.ts
describe("fetchTweetWithMedia", () => {
    const user2 = new User({id: faker.datatype.uuid()});
    const otherUserTweet = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16) user: user2 })

    beforeAll(async () => {
        await UserRepository.create(user2);
        await TweetRepository.create(otherUserTweet);
    });

    const addUserIntoStore = async (): Promise<User> => {
        const user = new User({ id: faker.datatype.uuid() });

        await UserRepository.create(user);

        return user;
    }

    const addMediaIntoStore = (): Promise<Media> => {
        const media = new Media({  mediaUrl: faker.image.imageUrl() });

        await MediaRepository.create(media);

        return media;
    }

    const addTweetIntoStore = ({user, with}: {user: User, with?: Media}): Promise<Tweet> {
        const tweet = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user, media: with })

        await TweetRepository.create(tweet);

        return tweet;
    }

    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
});
```

上記のコードで気になる点が2つあります。

1. `user2`と`otherUserTweet`って結局何？
2. `media付のツイートだけ取得できること`と`mediaのついていていないツイートは取得できないこと` って条件もやっていることも同じで、確認事項だけ違うじゃん。共通化したほうがよくない？

それぞれ具体的に見てみましょう。

## 暗黙のテストケース

`fetchTweetWithMedia` は第一引数に`User`を渡しているところから鑑みるに、対象の`User`のツイートのみを取得できる機能のようです。

これから察するに、`user2`や`otherUserTweet` は「対象のユーザー以外のツイートのみを取得できないこと」を暗黙的にテストしているのだと思います。
正直、自明すぎる条件なので、わざわざテストケースに記載しない気持ちはわかります。ですが、AAAを意識し、テストケースにすべて押し込めるという点を考えると、これではだめですね。

こういった、何らかの暗黙的な条件を書いてしまうことは、意識の外で書いてしまうこともあります。なのでいっそのこと `beforeAll` や `beforeEach`（jestにおいてテストケースの実行前に都度実行される処理）を**削除することをおすすめ**します。もちろん`beforeAll`だけではなく、describe直下にあるようなコードも、関数の定義のみだけにするとこのようなことは絶対に起きなくなります。

そうするとこうなります。

```typescript:前提条件をすべてテストケースに押し込んだ
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser });
        const nonTargetUser = await addUserIntoStore();
        await addTweetIntoStore({user: nonTargetUser });

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })
        const nonTargetUser = await addUserIntoStore();
        await addTweetIntoStore({user: nonTargetUser });

        const tweets = await fetchTweetWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
```

改善前のテストコードも十分違和感たっぷりでしたが、このコードはソレ以上に違和感たっぷりですね。違和感の原因は、全く利用されていない `nonTargetUser`とそのユーザーのツイートです。
この時点で「あ、テストケースが必要だな」ということは流石に気づきます。

正直あまりにも自明すぎるのでテストケースを作成しないのもありですが、無いよりはあったほうがいいので、絶対作成しましょう。

```typescript:他のユーザーのツイートが取得できないことのテストケース.ts
    it("他のユーザーのツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const targetmedia = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: targetmedia });
        const nonTargetUser = await addUserIntoStore();
        const nonTargetMedia = await addMediaIntoStore();
        const otherUserTweet = await addTweetIntoStore({user: nonTargetUser, with: nonTargetMedia });

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
        expect(tweets).not.toEqual(expect.arrayContaining([otherUserTweet]));
    });
```

新たにテストケースを作成しましたが、ここで先程と異なる条件があります。それは、`otherUserTweet`にMediaがくっついていることです。

テストケースを記載しているときにとあることに気づきます。「あれ、これ他のユーザーのツイートを取得できないことではあるが、『他のユーザーのツイートだから取得できない』のが『Mediaのついていないツイートだから取得できない』のかわからないな」と。

単体テストに限らず、様々な検証で最も大事なことは **テストでの確認項目以外の対象の条件を揃える**ことです。今回で言えば「他のユーザーのツイートは取得できないこと」がテスト対象なので「取得できるツイート」と「取得できないツイート」の条件の違いは「ユーザーが違う」以外同じである必要があります。
以前のコードでは別のユーザーのツイートはMedia付きではありませんでした。ですが、今回新たにテストケースを作成したとき、テストケースの条件を整理できたからこそ、そこに気づけたわけです。

暗黙のテストケースを記載してしまうことは滅多に無いとは思いますが、記載してしまうと、レビュワーやコードを読む人に疑問符を与えてしまうだけです。そのようなコードを撲滅するため **前提条件はすべてテストケースに記載する**ということを意識してみるといいと思います。
そうするとテストケースに現れない暗黙のテストが消えていき、**適切にテストケースが増えます**。

## テストケースの分割の粒度

下記のテストケースですが、実は確認事項以外全く一緒です。

```typescript:テストケースが全く一緒なコード
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
```

これらのテストケース、分割する意味があるのでしょうか？

条件が全く一緒でも、テストケースを分割したほうがいい場合はあります。というかむしろ結構あります。
分割の条件の1つとして、**確認事項の関心対象が分割できる場合、テストケースを分割したほうが良い**と私は考えます。

関心対象とは何でしょうか。それは例えばRDBのテーブル、関数などの意味的に分離できるものだと思います。正直「なんとなく分割できるもの」というふんわりイメージで分離しています。

例えば今回の `fetchTweetWithMedia` ですが、単純な取得処理だけではなくて下記のような動作だとしましょう

- ツイートが取得されたことを保存する
- 対象のツイートの閲覧回数を増加させる

`fetchTweetWithMedia`メソッドがその責務を持っていることに対する是非はともかく、上記の動作なので、それもテストしたいですね。

そうなると下記になります。

```typescript:追加のテスト
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
        expect(tweets[0].viewsCount).toBe(1);
        // addViewTweetLogという関数が有り、ソレをjestの機能でモックしている。
        // モックされた関数は、toBeCalledWithなどで引数をテストできる
        expect(addViewTweetLog).toEqual(tweetWithMedia);
    });
```

問題はなさそうですが、itの説明文とあっていませんよね。itは「meida付きのツイートだけ取得できること」ですが、中身ではtweetの閲覧回数やログが吐かれていることを確認しています。これでは [暗黙のテストケース](#暗黙のテストケース)と何ら変わりありません。

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

「テストを書くこと」だけを目的にしたら上記は非常に冗長ですが、「テストを読む人」からしたら、上記のほうがわかりやすいです。正直、**テストを読む人はレビュワーでも無ければ実装なんて読まない**のでitの中身を読むだけで仕様がわかるのがベストです。

それならばitの中に確認事項すべて書けばいいじゃないか、つまり上記の例の場合は「media付きのツイートだけ取得でき、閲覧回数が増え、ログが吐かれること」と書けばいいじゃないのかと思われるかもしれません。
確認事項が5個とか10個とかになっても簡潔に書ける自信がありますか？Noであれば分割することをおすすめします（ちなみにその場合は関数やメソッドを適切に分割することもおすすめします）。

最初の質問に戻りましょう。下記のテストケースは分割したほうが良いか？

```typescript:分割するべきか、そうでないか.ts
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });

    it("mediaのついていていないツイートは取得できないこと", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
 ```

分割する条件として、確認事項の関心対象を挙げました。上記2つのテストケースの確認事項は「戻り値のtweetsが何であるか」あり、関心対象も何も全く同じものを確認しています。なので、分割する必要はないと考えます。
もっというと、テストケースの意味を考えると、実は2つのテストケースは表裏一体です。「media付のツイートだけ取得できること」ということは「mediaのついていていないツイートは取得できないこと」ということなわけです。

なので正直下記のテストで完璧に確認できています。

```typescript:テストを統合した.ts
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
    });
 ```

 ただ上記のテストコードから「mediaのついていないツイートが取得できていない」ということをアピールできていません。`.toEqual([tweetWithMedia])`であるため、`tweets`の中身は`tweetWithMedia`しかなく`tweetWithoutMedia`が無いことは確認できているのですが、「mediaのついていないツイートが取得できていないことを確認している」ことをアピールするために、無駄にコードを追加してあげましょう。

 ```typescript:統合前のテストケースのことも思い出してあげて.ts
    it("media付のツイートだけ取得できること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        const tweetWithoutMedia = await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets).toEqual([tweetWithMedia]);
        expect(tweets).not.toEqual(expect.arrayContaining([tweetWithoutMedia]));
    });
 ```

もちろん無駄なコードがいらないと思う人もいれば、分割したいなぁと思う人もいるかと思うので、個人差のある箇所かと思います。視点の1つとして**何を確認しているのか、を基準にテストケースを分割しましょう**。

# 起と結を明確にしよう

[テストケースの分割の粒度](#テストケースの分割の粒度)でも記載しましたが、実は `fetchTweetWithMedia` はTweetの閲覧回数を内部的に1増やしていました。そのことについてのテストケースが下記です。

```typescript:Tweetの閲覧回数が増えることを確認するテスト.ts
    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, with: media });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets[0].viewsCount).toBe(1);
    });
```

実はここに2つの暗黙的条件が記載されています。わかるでしょうか？

- `addTweetIntoStore` で作成したTweetの閲覧回数が0であることを前提としている
- `fetchTweetWithMedia`で返ってくる値は「内部的にDBで更新した後の値と全く同じになる」ことを前提としている

前者はともかく、後者は少し分かりづらいですね。1つづつ見ていきましょう。

## 生成した値に前提する動作はやめよう

テストはAAAパターンで記載することは[AAAまたはGiven-When-Thenをテストケースに押し込める](#AAAまたはGiven-When-Thenをテストケースに押し込める)に記載しましたが、それぞれの単純に並べるのではなく、**一つのストーリーとして読み取れる状態になること**を意識しましょう。

今回は `tweet.viewsCount`が1つ増えることを確認していますよね。なのでストーリーとしては

- Arrange:`tweet.viewsCount` を0とする
- Act: `fetchTweetWithMedia` を呼び出す（裏側で対象の`tweet.viewsCount`が1増える）
- Assert: `tweet.viewsCount`が1である

となります。今回のテストケースではこのArrangeに当たる「`tweet.viewsCount` を0とする」の記載が抜けています。
そのためそれを改善すると下記のようになるでしょう。

```typescript:Tweetの閲覧回数の初期値が0であることを明示的にするテスト.ts
    ...
    const addTweetIntoStore = ({user, with}: {user: User, createProps?: Partial<Tweet>}): Promise<Tweet> {
        const tweet = new Tweet({id: faker.datatype.uuid(), content: faker.datatype.string(16), user: user, ...createProps })

        await TweetRepository.create(tweet);

        return tweet;
    }
    ...
    it("media付きのツイートを取得した際、対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, createProps: { media, viewsCount: 0 } });
        await addTweetIntoStore({ user: targetUser })

        const tweets = await fetchTweetWithMedia(user);

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

        const tweets = await fetchTweetWithMedia(user);

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

        expect(tweetWithMedia.viwsCount).toBe(0);

        const tweets = await fetchTweetWithMedia(user);

        expect(tweets[0].viewsCount).toBe(1);
    });
```

## 確認すべき値がどこにあるかを意識しよう

今回のテストケースで確認したいことは `viewsCount`が増えることですよね。なのでテストでは ` expect(tweets[0].viewsCount).toBe(1);` として確認しています。でもこの `tweets[0]`ってどこからやってきた値ですか？ `fetchTweetWithMedia`の戻り値ですよね。貴方（このテストを書いた人）が本来意図しているのって`fetchTweetWithMedia`の戻り値の`viewsCount`が増えていることなのでしょうか？　おそらく違います。本来の意図は、DB上のツイートの`viewsCount`が増えていることでしょう（DB上にの`viewsCount`というカラムがあることを前提としています）。

すなわち**本当に確認すべき場所がどこなのかを気にする必要**があります。
今回のケースに置いては、実装的には同じ意味だし細かい違いじゃん、と思うかもしれません。ただｓDBに保存し忘れるとか、JavaScriptだと非同期処理に`await`をつけ忘れることでしばしば大変になることもあり、そういったミスを防ぐためにもできる限り本来どこの場所がどうなっていないといけないかを記載します。

```typescript:Tweetの閲覧回数の初期値が0であることを明示的にするテスト.ts
    it("media付きのツイートを取得した際、DB上の対象のツイートの閲覧回数が増えること", async () => {
        const targetUser = await addUserIntoStore();
        const media = await addMediaIntoStore();
        const tweetWithMedia = await addTweetIntoStore({ user: targetUser, createProps: { media, viewsCount: 0 } });
        await addTweetIntoStore({ user: targetUser })

        await fetchTweetWithMedia(user);

        const updatedTweet = TweetRepository.find(tweetWithMedia.id);    
        expect(updatedTweet?.viewsCount).toBe(1);
    });
```

修正するに当たり、itの説明文にも`DB上の`というのをつけました。もちろん明示していなくてもなんとなくDB上の値が更新されるんだろうなぁと想像はできますが、正しく記載するきっかけにもなります。

こちらは読みやすいテストコード、というよりもむしろ間違いづらいテストコードではありますが、結果的に読みやすさにも繋がります。正しいコードはいつだって正しくないコードよりは読みやすいですからね。

# 諸刃の剣のRandomly

この章は読みやすさというよりも、正しいテストコード・テストケースとはなんだろうかという観点で記載しています。

[faker.js](https://fakerjs.dev/)[^faker]はJavaScript用のライブラリで、テストで使えるランダムな値を生成できるものです。
例えばRubyでもFakerというgemもありますし、FactoryBot（僕の知っているのはFactoryGirlですが）など類似なライブラリは様々な言語にあると思います。

[^faker]: [ちょっと色々ありました](https://gigazine.net/news/20220111-open-source-developer-corrupts-libraries/)

これを活用すれば、強固なテストが記載できます。乱用すると若干読みづらい気もしますが、僕は気にせず乱用しています。
しかしながら、ランダムな値は用法を間違えるとflaky test[^flaky-test]として跳ね返ります。
基本的にはすぐに見つかりますが、Flaky Testは結構面倒くさいので避けたいです。PR作ってテストが落ちて、確認したら全く触っていない知らないテストだったときの辛さは計り知れないものがあります。

[^flaky-test]: Flaky Testは実行結果が不安定なテストのことです。簡単に言えば数回に1回落ちるテストです。原因は今回記載するようなランダム生成の値がたまたまエラーな値になったり（私が遭遇したやつは文字列に `/` が入った場合URLが壊れてエラーになる）、テストの順番によって発生する（私が遭遇したやつは、特定のテストが特定のfirestoreのコレクション（DBのテーブル的なやつ）をクリアせず残していたため、その値が別のテストケースで暴れることがありました）などがあります。

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

個人的にはfakerを使う箇所のルールは2つあります。

1つ目は、Aを入力したらAが返ってくる場所。例えばツイートを作成したら、ツイートが保存されていることを確認する際の、ツイート内容である`content`はfakerで作成します。何らかの固定値でも良いのですが「ここはなんの値が入っても基本的にはいいよ」という意図を表しています。ただしツイートの文字数は140文字制限（英語だと280字）ですが、その制限をテストする場合はまた別です。

2つ目は、該当の項目が様々な入力を受けつけられるが、特定の条件がある場合にはランダム生成の条件をちゃんと記載してあげることです。
例えば上記の例では、1〜4個のメディアという範囲があるのでちゃんと「1〜4」を指定してあげました。
しかしながら、これはテストの基本中の基本である境界値のテストをしてあげたほうがいいでしょう。もちろんランダムな個数のテストはあってもいいですが、それに加えて「0個の場合（これは上記のテストの「引数のmediaListが空の場合、エラーになること」のテスト）」、「1個の場合」「4個の場合」「5個の場合（エラー）」を確認するべきです。
そのため、特定の条件がある場合に、わざわざfakerを使ってデータを作成するのはあまり得策ではなく、何らかの理由がなければランダムな値は使わないほうがいいでしょう。

# モックの数はエンジニアの怠慢の指標?

この章も読みやすさというよりは壊れにくい・メンテナンス性の高いテストの書き方に繋がっています。
また、下記はJestのMock機能だけの話かもしれません。他のライブラリのモック機能を知らないので。

Jestにはmockという機能がありますが、他の様々な言語にもあるかと思います。あくまでJestですが、特定のファイル全体をモックしたり、一部の関数をモックしたり、様々な範囲のモックができます。

一般的にモックとは、例えば外部APIなどを利用するなど、環境を用意するのが難しかったりする場合に利用します。一般的には前提条件、すなわちArrangeを用意するのが面倒くさいときに利用されます。
後者は使い方を誤るとインシデントが発生します。この前発生しました。まぁ流石にかなり不運が重なったからではありますが。
モックの容量用法を間違えると、モックありきのテストを記載することになったりします。私の環境ではモックががんじがらめになりすぎて、新しくテストファイルを作成した結果、1つのファイルに対して2つのテストファイルが存在するような処理もありました。多量のモックは牙を剥いてきます。

下記のテストの例を見てみましょう。
`createTweet`のテストなのですが、`createTweet`の中では、`Tweet`をいい感じに修正する関数である`makeTweetFeelGood`関数を読んでいます。この`makeTweetFeelGood`関数なのですが、めちゃめちゃいろいろなことを行うので準備するのが面倒くさいです。例えば外部APIに通信してもツイート内容が問題ないかを確認したり・ツイート内容を適切にフォーマットしたり・特定のルールに従ってツイート内容を改変したり・mediaが問題ないかAIに確認してもらったり、もうとにかく面倒くさい。なので、`makeTweetFeelGood`関数をモックしています。
注目したテストケースは同じ内容のツイートを2連続で呟け無いことを確認しています。

```typescript:ツイート作成のテスト.ts
import * as makeTweetFeelGoodGlobal from "make-tweet-feel-good.ts";
...

describe("createTweet", () => {
    it("同じ内容のツイートが2連続呟けないこと", () => {
        const content = faker.datatype.string(16);

        const mockedReturnTweet = new Tweet({ content });
        // makeTweetFeelGoodの戻り値を無理やりモックの機能を使って変えています。
        const spy = jest.spyOn(makeTweetFeelGoodGlobal, "makeTweetFeelGood");
        // makeTweetFeelGoodはいかなる場合もmockedReturnTweetを返すようになります
        spy.mockReturnValue(mockedReturnTweet);

        const createProps = { content };

        // 一回目
        await createTweet(creatProps);

        // 二回目
        await expect(() => createTweet(cretaProps)).rejects.toThrowError(new SameContentTweetError());
    });
});
```

テストを記載して、コードを書いて、流してみても一向にテストが通りません。でも何度実装を見ても問題ありません。

`createTweet`の実装の一部です。`feelGoodTweet.createdAt` 以前のツイートの最新のツイートを取得し、その内容が一致していたらエラーになるというものですね。パッと見は問題なさそう。

```typescript:ツイート作成の実装.ts
export type CreateProps = { content: string, mediaList?: Media[] }
export const createTweet = async (createProps: CreateProps): Promise<...> => {
    const tweet = new Tweet({ ...createProps })
    ...
    const feelGoodTweet = makeFeelGoodTweet(tweet);
    ...
    const latestTweet = TweetRepository.fetchAll({ before: feelGoodTweet.createdAt, orderBy: {column: "createdAt", desc: true }, limit: 1 })[0];

    if(latestTweet?.content === feelGoodTweet.content) {
        throw new SameCOntentTweetError()
    }
    ...
}
```

しかし、テストが通らないということは問題有りということです。実はこれ、モックに問題が有りました。
問題を確認しましょう。コメントで問題の注釈を記載しています。

```typescript:同じ内容のツイートが呟け無いことを確認するテスト.ts
    it("同じ内容のツイートが2連続呟けないこと", () => {
        const content = faker.datatype.string(16);

        // mockedReturnTweetの `createdAt` は現在時刻に依存します。例えば 2020-01-01 12:00:00 とします
        const mockedReturnTweet = new Tweet({ content });
        const spy = jest.spyOn(makeTweetFeelGoodGlobal, "makeTweetFeelGood");

        // そうここが問題。このとき返るTweetの`createdAt` は`mockedReturnTweet`のもの
        spy.mockReturnValue(mockedReturnTweet);

        const createProps = { content };

        // 一回目
        // 一回目で作成したツイートの`createdAt`は100% `mockedReturnTweet`より後になります。例えば 2020-01-01 12:00:01
        await createTweet(creatProps);

        // 二回目
        await expect(() => createTweet(cretaProps)).rejects.toThrowError(new SameContentTweetError());
    });
```

```typescript:ツイート作成の実装.ts
export const createTweet = async (createProps: CreateProps): Promise<...> => {
    // 二回目に流れてきた場合を考えましょう
    const tweet = new Tweet({ ...createProps })
    ...
    // 本来ならmakeFeelGoogTweetは上で作成された｀tweet`を元に色々処理を行います
    // しかしながらモックされているため、ここで返されるtweetの `createdAt` は 2020-01-01 12:00:00 です
    const feelGoodTweet = makeFeelGoodTweet(tweet);
    ...
    // `createdAt` は 2020-01-01 12:00:00 ですが、一回目に作成されたツイートの `createdAt` は 2020-01-01 12:00:01 です。
    // なのでこのとき `lastTweet`は1件も取得できません。
    // ちなみにJavaScriptでの配列の範囲外アクセスはundefineという値が取得でき、エラーになりません。
    const latestTweet = TweetRepository.fetchAll({ before: feelGoodTweet.createdAt, orderBy: {column: "createdAt", desc: true }, limit: 1 })[0];

    if(latestTweet?.content === feelGoodTweet.content) {
        throw new SameCOntentTweetError()
    }
    ...
}
```

上記コメントで記載したとおりですが、モックをすることにより、本来ありえない状態になることが問題でした。具体的には `createdAt` の時間が、モックされたタイミングで固定されてしまい、実情と異なってしまうのがだめでした。
なので、修正案としては下記となります。

```typescript:修正案.ts
    it("同じ内容のツイートが2連続呟けないこと", () => {
        const content = faker.datatype.string(16);

        const spy = jest.spyOn(makeTweetFeelGoodGlobal, "makeTweetFeelGood");
        // 何もせず、入力をそのまま返すようになった
        spy.mockImplementation((tweet: Tweet) => tweet);

        const createProps = { content };

        // 一回目
        await createTweet(creatProps);

        // 二回目
        await expect(() => createTweet(cretaProps)).rejects.toThrowError(new SameContentTweetError());
    });
```

モックは可能な限り利用せず、外部APIなどの部分を利用する部分のみモックするのがベストです。
しかしながら、そうはいっても、モックを使ったほうが圧倒的に楽になる部分があるのも事実です。

正直モックの利用すべきかどうかを完全に文章化できておらず、都度考えたり勘だよりです。しかしながら、モックしても問題ないものはいくつかあります。例えばログをテーブルに書き出す処理である`createLog`関数は、多分本来の実装にはほとんど影響ありません、多分。

何度も記載している通り、外部APIなどを利用する部分はモックせざるを得ません。
また**呼ばれることに強い意味のあるメソッドや関数はモックしてもいい**と思います。その**呼ばれる関数自体がちゃんとテストされていることが前提**ですが、今回の`makeTweetFeelGood`はソレに該当すると思います。つまり「ツイートを作成するときにmakeTweetFeelGood関数を通したツイートが作成されること」という事実が大事なのでモックしてもいいのではないか？ということです（それだと、実行するだけして、実行前の値を保存してるうっかりミスは防げないけど）。

個人的には、**モックの数がエンジニアの怠慢の証**と自らを戒めており、可能な限りモックは利用しないテストを心がけています。しかしながら、モックを利用しないと関数の中で呼び出されている関数の中で呼び出されている関数のデータを正しく用意する必要などがあるため、ノイズがテストに増えることもあります。そのあたりは具体的なルールではなく、**トレードオフ**だと思います。

# まとめ

私自身がテストコードを書くときに気をつけていることを書き出してみました。

- テストケースのすべてをテストケースの中だけ読めば分かる状態にする
    - beforeEachやbeforeAllなどに共通なオブジェクトなどをまとめて置きたい気持ちを抑える
    - テストケースなんて冗長すぎるぐらいでいいという気持ちを持つ
- AAA(Arrange・Act・Assert)を意識する
    - Gived-When-Thenのように「どういうときに」「何をやったら」「どうなる」というストーリーにする
    - とくにArrangeはコード量が多くなり、冗長になりがちで、まとめたくなってしまう
    - まとめるときは後に記載する起と結のストーリーを上手く描けるように、準備用の関数などに切り出し「何をやっているか」というニュアンスがテストケースに残るようにする
- テストケースだけで対象が何をやっているかわかるようにする
    - 基本的に人はテストケースの説明しか見ないし、テストの結果にもテストケースの説明しか出ない
    - そのため暗黙的に考えているテストケースがある場合は、それを明示的にする。そのためには共通のオブジェクトを排除すると見えることがある
    - テストケース1つでは、テストの対象が「何をやっているか」1つのみを確認するようにしよう。テストの対象が複数のことをやることはざらにあるが、それらを分割しよう
- 起と結を明確にする
    - 確認するべき事柄が、最初どういう状態だったかを明示しよう。つまりAssertで確認する対象は可能な限りArrangeでどういう状態なのかを規定しよう
    - Assertで確認する値が、本来はどの値なのかを見極めよう。特に対象の戻り値なのかDBに保存されている（更新された）値なのかは注意しよう
- ランダムな値が利用できる箇所を考える
    - Aという入力に対してそのままAが何らかの形で出てくる（特定の関数の引数、保存される値、戻り値の一部など）場合に利用する
    - 特定の条件を表すためにランダムな値を利用するときはflakyなテストにならない用に気をつける
- モックは無いなら無いほうがいい
    - モック自身が便利な機能なので、地獄の沙汰もエンジニアの腕次第
    - モック以外にも言えるが、読みやすさと壊れやすさのトレードオフを考えること

あくまで若造の考え方の1つであり、また言語やパラダイム、ライブラリやチーム等によって書き方は様々あるでしょう。
しかし**綺麗な読みやすいテストコードと綺麗な読みやすいコードは評価軸が異なるのは間違いないです**。テストコードはTDDでもしない限り、コードの副産物とかんがえてしまいますが、「綺麗なテストコードとはなんだろうか」自分なりに考えてみると発見があります。
