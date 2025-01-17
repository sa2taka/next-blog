---
layout:      post
title:       2024年を振り返る（裏）
category:    look-back
author:      sa2taka
tags:        
public:      true
createdAt:   2024-12-31
updatedAt:   2024-12-31
latex:       false
description:
   裏と書いていますが、とくに意図はないです。今までのやつとは違う振り返り、というだけ。
---

[2024年を振り返る](https://blog.sa2taka.com/post/2024-look-back/)の記事はいままでのスタイルで書いたやつですが、これは振り返りではなく、日記です。1年に1回しか書かないから年記だけど。

なんとなく次に繋げられるようなものが振り返りだと思うので、襟を正して書いてみましょう。

私自身は趣味も大して無いし交友関係も無いので、仕事ばっかりの人生を送っています。一方で仕事の方は表の振り返り記事でも書いているようにリーダーとして開発を進めるようにもなり、経験値は着実に積まれているように感じます。

良い点悪い点を文章で考えます。

仕事としては既存のチームで大規模な改修を1つ、中規模の機能改善を1つ、そして新規システム開発のリーダーを半年ほどと、内容だけは充実した1年でした。

大規模改修で良かった点は（ほぼ）障害を起こさなかったこと。システムのほとんどに影響し、コードとしても10%を書き換える工事にもかかわらず。その要因の1つ目は**変更の方針**を決めて、そこから順番を逆算して考えていったことでしょうか。この改修の主な目的は機能変更でしたが、時間を書けた大部分は機能変更を今後スムーズに行うための大規模リファクタリングでした。リファクタリングを行った結果機能変更自体は1週間程度の実装で完了しています。リファクタリングというには少し振る舞いが変わりすぎているような気がしますが、変更の方針として「フロントエンドの挙動は変えない」を建てたので、リファクタリングと読んでいました。最終的に多少は変わりましたが、フロントエンドの挙動を変えない方針は、つまりAPI定義は変えないことになりました。そこから細かいタスクへと分離していきました。タスクごとに考えることは違いますが、同じ方針で実装することで、最終的にまとまりのある実装になりました。
新規システム開発時の反省からも**方針を決める**の重要性は感じました。もちろん新規システムでも「こういった目的でこういった機能を作る」という大方針のようなものは決まっていますし、チームメンバーともコミュニケーションで高い理解をしてもらっていたと思います。このプロジェクトは都度課題が出ており、そのたびにスプリント単位の方針や目標が変わるような状態でした。私としては方針が変わるたびに抽象的なタスクを具体的にタスクを置き換え、そしてメンバーに渡すようなことを行っていました。それを行うとメンバーのタスクが枯渇しだし、結果としてメンバーのやることが無くなっていく状態になりました。方針をメンバーに伝えるだけでその状態を解消できるわけではないでしょうが、短期間の方針を決めればメンバーも自主的にタスクをみつけ、かつそのタスクがあまりにも別方向に行くようなこともありません。
大方針だけではなく、**短期間での方針**を決め、それを**他者とのコミュニケーションで活用する**ことを意識することを今年行っていきたいと思います。その方針は複雑で長文ではなく、**簡潔で短い言葉**を心がけていきます。[アイデアのちから](https://bookplus.nikkei.com/atcl/catalog/08/P46880/)の知識は少しこれの目的には過剰かもしれませんが、活用できると思います。

中規模ながら、機能改善ではよくできたプロジェクトでした。このプロジェクトを振り返るとかなり適切に**役割分担**をできたと思います。いわゆるドメインエキスパートと私の2人で開発を進めましたが、ドメインエキスパートが要件を細かく定義し、定義している間に私が外堀の仕組みを作成。ドメインエキスパートが要件を作りやすいように必要な情報を提供し、システム的にも作りやすいような仕組みを作っていただいた。まさに阿吽の呼吸で進んだプロジェクトでした。
一方で新規システムは私も、そして相方も経験は浅かったです。相方は優秀ではありましたが、適切に役割分担をできていなかったような気がします。相手がやるべきことを私がやったり、果てには私が決めていたりするようなこともあったような気がします。[他人が持つべき責任を自分が持たない](https://blog.sa2taka.com/post/owning-your-responsibilities-without-overstepping-boundaries/)を書いた理由の1つではあります。
そこからの学びとして、**私が決めることと、相手が決めることを見極めていくこと**が重要だと感じました。相手が決めるべきことかどうかを判断します。その判断結果が今すぐ必要になる（例えばそれに従って機能開発の方針が決まる）場合では、その温度感をコミュニケーションを行い、必要であればファシリテーションを行います。しかし、自分が決めることはしないことを強めに意識します。相手にも「すぐに決めてください」とプレッシャーを書けることは行いません。ただ「開発でこういう都合で情報が必要なため、優先度を高めて欲しい」とその背景のコミュニケーションだけを行います。相手の責任までを自分が持たず、相手とともに進めることを意識します。

「個人で瞬間の最大風速を出す」こと得意分野です。つまりその場で最速で考え、PDCAを高速に回し、最善にたどり着くことは得意です。ただし、これは一人で対応するときだけです。
最近はチームだったり、少なくとも0から2人以上で作ることが多いです。そうすると私だけではなく相手とともに対応したり、更に相手がまた別の人と私がいないところで決めたりと、私より遠いところで決まるものにも責任を持って携わるようになりました。
そうなると、私の独善的な考えでは決して前には進みません。上記の話もそうですが、私が**解決まで**タスクを握ることを重要視したいと思います。相手に巻き取ってもらったから、ではなく、責任は私にあるのであれば私も解決まで握り続ける。そしてそのためには会議、そして文章作成のスキルが必要になると考えています。
複雑な課題は1度や2度の議論では結論は出ません。加えて議論相手も忙しい相手が多くなります。そうなると1度のリアルタイムの会話の密度を上げる技術、そして非同期でのコミュニケーションの技術、課題の明確化や齟齬のない伝え方のための文章力、そういったものが必要になります。