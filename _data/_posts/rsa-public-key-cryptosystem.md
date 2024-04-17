---
layout:      post
title:       RSA公開鍵暗号についてそれなりに力を入れて考えてみたら
author:      sa2taka
category:    cipher
tags:        cipher,暗号,rsa
public:      true
createdAt:   2020-10-28
updatedAt:   2024-04-17
latex:       true
description:
  RSA公開鍵暗号はDH法が現れた翌年発表されました。その論文の流れに沿ってRSA公開鍵暗号について調べてみました。  
---

以外に無くは無いんだと、気がついた（上から目線）

ハローワールド。

[前回調べたDH法](/post/diffie-hellman-key-exchange)に引き続き、代表的な公開鍵暗号のRSAについて調べてみます。
RSA公開鍵暗号はDH法が現れた翌年、R.L. Rivest, A. Shamir, and L. Adlemanによる論文"A Method for Obtaining Digital Signatures and Public-Key Cryptosystems"が発表されました。
彼らの名前の頭文字をとって「RSA」公開鍵暗号。実際にはイギリスのJ H Ellis、C C Cocks、Malcolm WilliamsonたちがRSA→DH法という順番に似たようなものを「先に」見つけているのですが、歴史の妙のお話ということで、具体的には調べませんでした。

ここでは彼らの論文[^a-method-for-obtaining-digital-signatures-and-public-key-cryptosystems]の流れに沿ってRSA公開鍵暗号方式について調べてみました。

[^a-method-for-obtaining-digital-signatures-and-public-key-cryptosystems]: R.L. Rivest, A. Shamir, and L. Adleman, "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems",https://people.csail.mit.edu/rivest/Rsapaper.pdf 2020/10/28閲覧

# RSA公開鍵暗号について

彼らの論文のAbstract（の一部）を読んでみましょう。

>An encryption method is presented with the novel property that publicly revealing an encryption key does not thereby reveal the corresponding decryption key. This has two important consequences.
>1. Couriers or other secure means are not needed to transmit keys, since a message can be enciphered using an encryption key publicly revealed by the intended recipient. Only he can decipher the message, since only he knows the corresponding decryption key.
>2. A message can be “signed” using a privately held decryption key. Anyone can verify this signature using the corresponding publicly revealed encryption key. Signatures cannot be forged, and a signer cannot later deny the validity of his signature. This has obvious applications in “electronic mail” and “electronic funds transfer” systems
>>暗号化鍵を公開しても、それによって対応する復号鍵は公開されないという斬新な性質を持つ暗号方式について紹介します。これは2つの重要な結果をもたらします。
>> 1. 意図した受信者によって公開された暗号化鍵を用いてメッセージを暗号化できるので、鍵を伝送するための宅配便やその他の安全な手段は必要ありません。対応する復号鍵を知っているのは受信者だけなので、受信者だけがメッセージを解読することができます。
>> 2. メッセージは、非公開の復号鍵を使って「署名」することができます。誰でも、対応する公開された暗号化鍵を使って、この署名を検証することができます。署名は偽造できないし、署名者は後で署名の有効性を否定できません。これは、「電子メール」や「電子資金移動」システムに明らかに応用されるものです。

DH法が解決したものは共通鍵の配送問題ですが、**RSAでは「公開鍵暗号」と「電子署名」の2つを行うことが可能**であり、多くの問題を解決し応用が可能となるものです。
電子署名はDHの論文でも示唆している部分であり、それの完全なる解答と呼べるのがRSA公開鍵暗号です。

あまりにも有名なためRSA = 公開鍵暗号方式 = デジタル署名という勘違い（?）が生まれて、おおよそ夏の季語と呼べるほどには「秘密鍵で暗号化」[^encrypt-by-private-key]の文言へのツッコミが見られますね。

[^encrypt-by-private-key]: ちなみにDH法が提案された論文"New directions in cryptography"には電子署名の提案がなされています。その中の文言（日本語訳）の一部にこう記載があります。「（前略）ユーザAは自分の秘密鍵でメッセージMを「復号」し、DA(M)を送信する。ユーザBはそれを受信すると、ユーザAの公開鍵で「暗号化」することで（中略）」いわゆるRSAでの電子署名の方法ですが、この時でも秘密鍵で「復号」という文言があります（ご丁寧にクオーテーションに囲まれて）。
この論文では秘密鍵が「secret deciphering key」、公開鍵が「public enciphering key」という記載になっており、役割を完全に固定したいた文言にもなっています。後ほどRSAでも具体的な記載がありますが、「秘密鍵で暗号化」というのは少なくともDH法、RSAでは間違いです。

# RSA公開鍵暗号の性質

RSA公開鍵暗号は2つのことができます。「公開鍵暗号」と「電子署名」です。因みにここでいう公開鍵暗号は任意のメッセージの暗号・復号できるものですね[^public-cryptosystem]。

[^public-cryptosystem]: おそらくRSAでこの利用方法は鍵交換のタイミングだけではないでしょうか...。わざわざ公開鍵暗号で行うより、鍵交換してから共通鍵でメッセージをやり取りするほうがずっと早いからです。実情は残念ながら知識不足ですが。

論文中では「公開鍵暗号システム」の4つの性質について記載があります。あくまでも論文内の記載はそうですが、広い意味では異なってしまいます。なので、一旦はあくまで下記はRSAの性質と理解しておきます[^public-key-cryptosystem]。

[^public-key-cryptosystem]: 例えばDSAの原型となったElGamal署名でも有名なElGamalさんが作ったElGamal暗号というものがあります。これは公開鍵暗号ですが、要素4は成していません（そもそも暗号文が2つに分割されてくるし）。なので署名のアルゴリズムとして別のElGamal署名を作る必要もあったんですね。

1. メッセージMを暗号化（$E()$）し、復号（$D()$）するとMが得られる。式で書くと
$$
\begin{aligned}
D(E(M)) &= M
\end{aligned}
$$
1. 暗号化（$E()$）と復号（$D()$）は簡単に計算できる
2. 暗号化（$E()$）の手順を公開しても復号（$D()$）は簡単に出来ない。つまり、当人だけが暗号化されたメッセージを復号でき、Dを効率的に計算ができるということである
3. メッセージMを最初に復号（$D()$）してから暗号化（$E()$）することでMが得られる。式で書くと
$$
\begin{aligned}
E(D(M)) &= M
\end{aligned}
$$

## 秘匿(Privacy)

上記の性質を見ればメッセージの秘匿（機密性の向上）は簡単にできそうですね。

AliceがBobに対してメッセージ$M$を秘匿して送りたい場合事前にBobの公開鍵（ここでは暗号化）$E_B$を受け取り、1.の性質を利用しAliceが$E_B(M)$により$M_E$を送り、Bobが$D_B(M_E)$を行うことでメッセージの送信が可能となります。ここで$M_E$が第三者に盗聴されていても、性質3より平文$M$は第三者にわからないというわけです。

## 署名(Signatures)

論文中では、署名に関しては背景、電子署名の必要条件などについても多く語られています[^digital-signature]。

[^digital-signature]: 署名は署名者に**加え**、**メッセージに依存する必要がある**という記載が明示されています。これにより完全性・真正性の向上の他に、否認防止が可能となります。
ちなみにDH法もそうですが（あえて記載はしていませんでした）、第三者攻撃に関しては脆弱ですので、その部分のセキュリティはまた別の対策が必要です。

そしてRSAでは電子署名は下記の方法で実現が可能です。

BobはAliceに署名付きのメッセージMを送信しようと思いました。

まず、Bobは署名$S$を下記の方法で求めました。

$$
S = D_B(M)
$$

この時論文には「**暗号化されていないメッセージを復号することは、性質4によって「意味のある(makes sense)」ことになります**」という注釈がされています。

次にAliceへメッセージを送信します。ただし、このときに送るのは$S$。更に秘匿するためにAliceの公開鍵（$E_A$）で暗号化し送ります（$E_A(S)$を送付する）。

Aliceは$D_A$でSを取得できるので、最後のBobの公開鍵$E_b$を利用しメッセージを取得できます。

$$
M = E_B(S)
$$

ここで性質を振り返ると、Bobの公開鍵で暗号化出来たため、SはBobしか生成できないはずの$(E_B(D))$である、つまりSはBobが生成したものであることがわかります。逆に言えば確実にBobが生成したため、Bobはこのメッセージに対する否認が出来ません。
また、Alice（または第三者）は$M$を改ざんし$M'$を生成した場合、その時は対応する$S'$も生成しなければならないが、それも不可能です。つまり$M$の改ざんも不可能となります。

この方法でデジタル署名を生成することが出来ます。DSAの方法とは異なり、デジタル署名から平文を生成できるのがRSAの特徴と呼べます。実際にはRSAでデジタル署名する場合は、実際はメッセージのハッシュ（SHA2などを利用する）を取得し、そのハッシュに対してRSAで署名を作成する方法が一般的かと思われます。

# RSA公開鍵暗号方式の具体的な方法

RSAは「公開鍵暗号方式」について公開鍵（$D()$)と秘密鍵（$E()$)という概念での説明をしていました。公開鍵は暗号化、秘密鍵は復号に用いります。

## 暗号化

RSA暗号方式では公開鍵は2つのパラメーターがあります（$e, n$）。2つのパラメーターのは正の整数です。

$n$ですが、これは2つの素数$p, q$の積となります（素数は任意です）。この$n$の長さ$k$はいわゆるセキュリティパラメータで、`ssh-keygen`の`-b`オプションで指定するbit数とかですね。
そして$n$が$k$の長さを持つために、論文内では2つの素数$p, q$は$k/2$の長さを持つことをおすすめ（RECOMMEND）しています[^n-length]。

[^n-length]: この文言はRSA暗号の標準である[RFC8017: PKCS #1](https://tools.ietf.org/html/rfc8017)では記載がおそらく有りません。$k$bitの$n$を生成する記載はありますが、$p, q$の桁数などは明記されていません。というのも素数を3つ以上利用するmulti-prime RSAなんてのもあるらしいからですかね。

そして$e$は$n$と互いに素である必要があります = お互いがの約数のうち1以外が一致しない = 1が最大公約数です。

RSAから少し離れますが、$\phi(x)$をオイラーの$\phi$関数と呼び、これは$1$以上$x$未満の値のうち$x$と素な数の個数を表します。
そして$e < \phi(n)$以下である必要が有り$\phi(n) = (p - 1)(q - 1) = n - (p + q) + 1$となるらしいです。

$e$を上記条件でランダムな値を取るとして、メッセージMの暗号化は下記手順です。
ただし$0 \leqq M < n$です。

$$
C = E(M) \equiv M ^ e \bmod n
$$

えらくシンプルですね。

## 復号

秘密鍵$d$は$e$より導かれます。DH法の逆ですね。$d$は下記を満たす正の整数である必要があります。

$$
e \cdot d \equiv 1 \bmod \phi(n) 
$$

これは任意の整数iを用いて下記のように求めることが可能です。

$$
\begin{aligned}
e\cdot d &= 1 \bmod \phi(n)\\
e \cdot d +  -i \cdot \phi(n) &= 1 \\
\end{aligned}
$$

これに対して[ユークリッドの互除法(Wikipedia)](https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%BC%E3%82%AF%E3%83%AA%E3%83%83%E3%83%89%E3%81%AE%E4%BA%92%E9%99%A4%E6%B3%95#%E6%8B%A1%E5%BC%B5%E3%81%95%E3%82%8C%E3%81%9F%E4%BA%92%E9%99%A4%E6%B3%95)を利用して、$d$と$i$を求めます（$e$と$\phi(n)$は互いに素であるため最大公約数は必ず1となります）。
具体的な手順は[具体例](#具体例)に記載しています。

$n, d$を用いて暗号文$C$を下記の式で復号出来ます。

$$
M = D(C) \equiv C^d \bmod n
$$

ちなみに、上記の式の証明も論文内に記載があるので、ここでは説明しませんが、詳しく知りたい方は読んでみてください。

また、RSAでは公開鍵$e$と$\phi(n)$から秘密鍵$d$を導出していますが、秘密鍵$d$と$\phi(n)$より$e$を求める方法も提示されています。

## 具体例

具体的な数字を利用して考えてみましょう。

$$
\begin{aligned}
p &= 11\\
q &= 17\\
n &= p \cdot q = 187 \\
\phi(n) &= (p - 1) \cdot (q - 1) = 160\\
e &= 23 \\
\end{aligned}
$$

ここで$d$を求めてみます。
目指す形は$d \cdot e +  -i \cdot \phi(n) = 1$ですね。

まずユークリッドの互除法を利用して最大公約数を求めます。と言っても必ず1になるのですが。
$$
\begin{aligned}
187 &= 6 \cdot 23 + 22(22 = 187 - 6 \cdot 23) \\
23 &= 22 \cdot 1 + 1 (1 = 23 - 22 \cdot 1)\\ 
1 &= 1 \cdot 1 \\
\end{aligned}
$$

続いては上記式の「途中」の式を用いて$d \cdot e +  -i \cdot \phi(n) = 1$の形へ持っていきます。今回は$d \cdot 23 +  -i \cdot 187 = 1$ですね。

$$
\begin{aligned}
1 &= 23 - 22 \cdot 1 \\
&= 23 - (187 - 6 \cdot 23) \\
&= 7 \cdot 23 + -1 \cdot 187 \\
\therefore d &= 7(i = 1)
\end{aligned}
$$

これで$d$が求まりました。

ここで"sa2taka"という文字列を暗号化したいとします。
この時の変換ルールと変換結果は下記とすると文字列を数字に変換可能です。

$$
0 = 00, 1 = 01, \ldots, 9 = 09 \\ \_(\text{space}) = 10\\ a = 11, b = 12,\ldots z = 36 \\
\text{sa2taka} = 291102301112111
$$

まずは公開鍵$e, n$で暗号化をしてみます。
ただし$M$は$n$未満である必要があるため、ここでは2桁づつに区切りそれぞれの桁で暗号化を行います。今回はsに値する$29$を例示してみます。

$$
\begin{aligned}
C &= M ^ e \bmod n\\
&= 29 ^ {23} \bmod 187 \\
&= 24
\end{aligned}
$$

続いて秘密鍵$d$で復号をしてみます。

$$
\begin{aligned}
M &= C^d \bmod n\\
&= 24 ^ {7} \bmod  187\\
&= 29
\end{aligned}
$$

他の文字列でも同様に求めることが出来ます。

また、今度は"sa2taka"に署名を付けて送ることを考えます。
単純に逆のことを行えばいいので下記のようになります（今回も送るのは29です）。

まずは署名作成。

$$
\begin{aligned}
S &= M^d \bmod n\\
&= 29 ^ {7} \bmod  187\\
&= 160
\end{aligned}
$$

そして署名検証。

$$
\begin{aligned}
M &= S ^ e \bmod n\\
&= 160 ^ {23} \bmod 187 \\
&= 29
\end{aligned}
$$

すごい（小並感）

# 最後に

DH法みたいなものを作り気力はなかったので// TODO:とします..。
