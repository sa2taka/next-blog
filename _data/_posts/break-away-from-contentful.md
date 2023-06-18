---
layout:      post
title:       Contentfulから脱却した
category:    other
author:      sa2taka
tags:        blog,contentful
public:      true
createdAt:   2023-06-18
updatedAt:   2023-06-18
latex:       false
description:
  私のブログの記事・画像管理をContentfulから脱却し、他の方法に移った話です。
---

私のブログは[一番最初の記事](https://blog.sa2taka.com/post/blog-created-with-nuxt-typescript-contentful-and-etc/)の通り、記事管理にContentfulを利用していました。

今回、Contentfulから記事管理・画像管理を脱却したので、新しい構成について記載します。

大きなアーキテクチャ変更は2度目です。いわばMyBlog v3はNuxt.jsからNext.jsに移ったので、これで最初のスタックで残っているのはTypeScriptだけです。

# 理由

なぜContentfulから脱却したのでしょうか？

Headless CMSどころかCMSさえ使ったことはないですが、おそらくContentfulはかなり使いやすい部類のCMSだと感じます。
モデルの定義や、幅広いメディアの対応、加えてメディアの変換なども簡単に出来ます。

ただ、私の使い方として合っていなかったのが理由でした。私はブログを作る前から [HackMD](https://hackmd.io/?nav=overview) というサイトを利用していました。そこで備忘録とかを書いていたのですが、その延長でブログの記事もHackMD上で記載していました。
ブログの記事をHackMDで記載し、それをContentfulにコピーするという運用。リリースするにはGithubからdeploy（静的サイトなので）する運用でした。ちょっと修正するだけでも大変で、事実上の二重管理にもなっているのがネックでした。

この程度のサイトにContentfulというシステムは高価すぎたため、脱却することとしました。

# 新しい構成

Contentfulでは記事管理・カテゴリ管理・画像管理をしていました。それらを全て[ブログシステムのgitで管理することとしました](https://github.com/sa2taka/next-blog/tree/main/_data)。

## カテゴリ

正直私のブログのカテゴリはかなり息をしていないので取っ払っても良かったのですが、一応残しました。

カテゴリは下記のような形式で管理しています。
こちらの形式ですが [frontmatter](https://middlemanapp.com/jp/basics/frontmatter/)という名前がついているそうです。

```
---
layout: category
name:   TypeScript/JavaScript
sort:   10
---
```

これはContentful側のモデルとほぼ同じです。ただしここには `id` がありません（CMS的に言うと `slug`）。`id`はファイル名となっていて、上記は `typescript.md` という名前で管理しています。`md`である必要は特に無いですが。

## 記事

記事もカテゴリと同様にfrontmatter形式でメタデータを埋め込んでいます。

例えば今回の記事では下記のようになります。

```
---
layout:      post
title:       Contentfulから脱却した
category:    other
author:      sa2taka
tags:        blog,contentful
public:      true
createdAt:   2023-06-18
updatedAt:   2023-06-18
latex:       false
description:
  私のブログの記事・画像管理をContentfulから脱却し、他の方法に移った話です。
---

私のブログは...
```

こちらもカテゴリ同様ほぼContentful側のモデルと同じで、`slug`はファイル名を利用しています。
また作成日・更新日は元々Contentful側のデータを利用していたのですが、明示的に埋め込むようにしていました。いくらでも改ざんが可能になってしまいますが、それはgitを見れば明らかなので...。理由としては内容が変わっていないような更新がかかった場合に無駄な更新日の更新が発生するからです。例えば今回画像管理もContentfulから脱却していますが、そのために画像のURLが変わっています。内容が変わっていないのに更新日が変わるのもなぁ...と考えこの構成となっています。

Contentfulから脱却し、git管理していることの最大の利点として、ローカルで編集が可能になることです。HackMDはGithubのRepositoryと連携する機能があるので（Zennみたいな感じでしょうかね）それを利用することも出来ます。
いずれにせよローカルで編集ができるということは、[textlint](https://textlint.github.io/)による構成を始めとした確認・修正の手段が利用できます。
[markdown-link-check](https://github.com/marketplace/actions/markdown-link-check)を利用してURLが死んでいないか確認できたり（代替先が見つからないURLも多いので修正はちょっと諦めていますが...）。

## 画像

画像に関しては基本的にはGit管理していますが、host先はfirebase hosting（ブログシステムのホスティング先）とは別にしています。
今回はGoogle Cloud Storageを選択しています。

選択した最大の理由は、単純にちょっと複雑なシステムにして楽しみたかったから、ぐらいなものです。

### Cloud Storageへの保存

私のブログの画像は通常の `.png`, `jpeg`, `.gif`と共に `.webp` 形式を採用しています。しかし[画像ディレクトリ](https://github.com/sa2taka/next-blog/tree/main/_data/_images)には`.webp`形式のデータはありません。
これはどういうことかというと、gitで管理しているのは元データで、Cloud Storage上に元データと`.wepb`に変換したデータが保存されています。

![CloudStorageにwebpも保存されている](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/CloudStorage%E3%81%ABwebp%E3%82%82%E4%BF%9D%E5%AD%98%E3%81%95%E3%82%8C%E3%81%A6%E3%81%84%E3%82%8B.png)

このブログはfirebase hosting上にホスティングされていますが、Cloud Storage for firebaseではなくCloud Storageを利用しています。
これには理由があります。[Cloud Storage for Firebaseのレスポンスを爆速化した話](https://qiita.com/qrusadorz/items/4a8e62c20bc788ab0585)や[KomecroアプリでFirebaseからの画像取得を早くした話](https://techlife.cookpad.com/entry/2018/11/02/100000)を参考にさせていただいているのでそちらのほうが詳しいですが本記事でも触れます。

Cloud Storage for firebaseの方は、画像のリクエストのタイミングで認証情報を確認します。当然私のブログは認証系の処理はありませんが、そういう仕組みになっているようです。Cloud Storageの方もおそらく無設定でやればそうなるでしょう。その後パラメーターをくっつけて再度リクエストしてデータを取得する、という動作のようです。

しかし、Cloud Storageの方にはそれ以外に公開アクセスという方法があります。名前の通り、バケットの内容を公開してアクセスできるようになります。このシステムの場合は[https://storage.googleapis.com/sa2taka-next-blog.appspot.com/my keyboard.png](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/my%20keyboard.png)に直接アクセスすると、特に問題なく画像が見られるようになります。
こちらを使えば、キャッシュが効きます。とはいえど、デフォルトでは1時間です。
私のシステムではworkbox（Service Worker）によるキャッシュがあるので、正直この複雑さは不要だったかもしれないです。

### そのための画像管理システム

上記のような若干複雑な構成となると、管理が面倒なのでは？と考えるでしょう。実際面倒です。
Contentfulも画像の登録が若干煩雑だなぁと感じてはいたので、今回更改するにあたり少なくともContentfulよりは便利にはしたかったです。
そのために画像管理システムを作成しました。と言ってもスーパーシンプルです。

![自作の画像管理システム](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/%E8%87%AA%E4%BD%9C%E3%81%AE%E7%94%BB%E5%83%8F%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.png)

色々な機能があります。ドラッグアンドドロップで画像をアップロードしたり、Ctrl-vの貼り付けで画像をアップロードしたり、名前を変えたり。コピーボタンで一発でmarkdown用のテキストをコピーできるのが便利です。ただ正直びっくりするぐらい使いづらいですが、これでもContentfulより使いやすいです（ログインしたり、いちいちいろんな設定する必要もないので）。

こちらはNext.jsのappディレクトリ機能を試したかったので、Appディレクトリ機能をONにして作成しています。この程度のアプリには不要であることがわかりました。
