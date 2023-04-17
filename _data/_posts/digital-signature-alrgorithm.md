---
layout:      post
title:       君もDSAについて考えてみてよ
author:      sa2taka
category:    cipher
tags:        
public:      true
createdAt:   2020-11-15
updatedAt:   2020-11-15
latex:       true
description:
  DSAのアルゴリズムについて簡単にですがまとめてみました。  
---

後で答え合わせしよう(電子署名)

ハローワールド

公開鍵暗号と呼ばれるものは一般的に2つのどちらかの処理を請け負っています。**「鍵交換」または「電子署名」**。
RSAはどちらも出来ますが、大体の場合はどちらか片方を目的としたアルゴリズムとなっています。

今回調べた「DSA」は「The Digital Signature Algorithm」、つまり電子署名のアルゴリズムです。えらくシンプルな名前ですが、これはアメリカの国立標準技術研究所(NIST)が定めた「[Digital Signature Standard](https://www.nist.gov/publications/digital-signature-standard-dss-2)」、つまりデジタル署名の標準の中で利用されているアルゴリズムだからです[^dsa-name]。本標準はFIPS186-4と番号が振られているので、今後はこの番号で呼ぶこととします。

[^dsa-name]: DSSの一番最初の標準である[FIPS186](https://csrc.nist.gov/publications/detail/fips/186/archive/1996-12-30)にはDSAの記載しか有りませんが、最新版である2013年のFIPS186-4ではRSAとECDSAのアルゴリズムの記載もあります。

今回はFIPS186-4を主としてDSAについて調べてみます。

# DSA について

まずはFIPS186-4の概要を読んでみましょう。

> This Standard specifies a suite of algorithms that can be used to generate a digital signature. Digital signatures are used to detect unauthorized modifications to data and to authenticate the identity of the signatory. In addition, the recipient of signed data can use a digital signature as evidence in demonstrating to a third party that the signature was, in fact, generated by the claimed signatory. This is known as non-repudiation, since the signatory cannot easily repudiate the signature at a later time
>> 本標準規格は、電子署名を生成するために使用できる一連のアルゴリズムを規定する。デジタル署名は、データへの不正な変更を検出し、署名者の身元を認証するために使用される。さらに、署名されたデータの受信者は、署名が実際に主張された署名者によって生成されたものであることを第三者に証明するための証拠としてデジタル署名を使用することができる。これは、署名者が後で簡単に署名を否認することができないため、否認防止として知られている

あくまでこの概要はDSS、つまりデジタル署名の標準についての記載です。

私の[DH法の記事](https://blog.sa2taka.com/post/diffie-hellman-key-exchange)や[RSAの記事](https://blog.sa2taka.com/post/rsa-public-key-cryptosystem)にも言及はありますが、デジタル署名の役割は上記の文章が簡潔に示しています。

つまり、

- 署名者の認証
- メッセージの改ざん検知
- 署名者の否認防止

を目的としています。

ただし、デジタル署名を認証に用いる場合、一つ問題があります。

まず、デジタル署名と鍵交換の大きな違いの一つとしては、**秘密鍵・公開鍵がエンティティ、つまり人やサーバー等と紐付いている必要がある**ことです[^ephemeral-DH]。
鍵交換はあくまで使い捨ての公開鍵と秘密鍵で問題はありませんが、デジタル署名では当然「そのエンティティから発行されたもの」と一意に紐付いていないと認証は不可能です。

[^ephemeral-DH]: ちなみに鍵交換では秘密鍵や公開鍵を使い捨てで作成することを「ephemeral: 一時的」なDH法、この場合はDHEなどと記載されます。これらは前方秘匿性(forward secrecy, またはperfect forward secrecy)を持ちます。すなわち、鍵交換の場合はある特定の鍵交換の1セクションで秘密鍵がバレても、過去に行われた鍵交換での秘密鍵はバレない性質を持つことになります。

しかし、突然送られてきたその公開鍵は本当にその人の物かは不明です。(鍵交換もですが)公開鍵暗号自体はMan-in-the-Middle(中間者攻撃)に弱いと呼ばれる所以です。すなわち公開鍵自体が本当に信頼できるものなのかが不明なのです。
FIPS186-4の中でも公開鍵と秘密鍵さえあれば「俺は大統領だ」と言ってメッセージに署名することが可能と例示されています(本当にその公開鍵が大統領のものなのかは誰にもわからないため)。

そのため、実際はSSL/TLSなどでよく登場するPKI(Public Key Infrastructure: 公開鍵基盤)のような存在が必要です。
公開鍵基盤により公開鍵とエンティティをバインド(紐付け)し、その公開鍵が大統領のものであることを保証します。
そういった機関のことをTTP(Trusted Third Party: 信頼された第三者機関)と呼んだりも、恐らくはします(この語句自体は恐らくもっと広い意味ではあるでしょうが)

ちなみにFIPS186-4でも上記について言及しており、このような一文もあります。

> A verifier requires assurance that the public key to be used to verify a signature belongs to the entity that claims to have generated a digital signature (i.e., the claimed signatory)
>> 検証者は、署名を検証するために使用した公開鍵がデジタル署名を生成したと主張するエンティティ(例えば主張する署名者)のものであることを保証する必要がある。

このときの保証の方法については恐らく具体的には記載がありませんが、PKIやTTPについての語句が「2.1 Terms and Definitions」に記載があるため、主としてこれらの利用を基にしているのではと思われます。

閑話休題。

# DSAの署名方法

DSAは複数のパラメータおよびハッシュ関数$\mathbf{Hash}$を利用します。ハッシュ関数はSHA-1、FIPS186-4ではSHA-2が選択可能となっています。

パラメータは下記の通りです。ただし、$L, N$は後術の値とします。

- $p$: $L$bitの長さの素数。モジュラ($\bmod p$)として利用される
- $q$: $N$bitの長さを持つ$p - 1$の素因数
- $g$: 既約剰余類群$GF(p) = (Z/pZ)^\times$の位数qの元[^g]。すなわち$1 < g < p$で$g ^ q \bmod p = 1$となる値
- $x$: 1以上$q$未満のランダムな整数。**秘密鍵**
- $y$: $g^x \bmod p$。**公開鍵**
- $k$: メッセージごとに固有な1以上$q$未満のランダムで**シークレットな**整数。

FIPS 186-4では$y$を公開鍵としていますが、実際は$p, q, g$も公開します。

この時$p$と$q$の選択方法はFIPS 186-4に記載があります。

[^g]: 原文は"a generator of a subgroup of order q in the multiplicative group of $GF(p)$"。記事内の文言と少しニュアンスは異なります。基本的には[離散対数を調べた私の記事](https://blog.sa2taka.com/post/discrete-logarithm-problem)で言葉の意味はわかります。

## LとNの値

FIPS186-4では$L$と$N$の値は下記の4つが明記されています。

$$
L = 1024, N = 160 \\
L = 2048, N = 224 \\
L = 2048, N = 256 \\
L = 3072, N = 256
$$

## 署名の作成

メッセージ$M$を署名します。署名は下記の式で導かれる$r$と$s$のペアです。上記のパラメータにも登場しましたが$k$はメッセージごとに固有です。
ただし$z$は$\mathbf{HASH}(M)$のbit列のうち上位の$\mathbf{min}(N, \mathbf{Hash}(M)\text{の長さ})$bitです。この時$\mathbf{min}(a, b)$は$a, b$のどちらか小さい方の値を取ります。まぁ$N$以下のbit数になればいいんですね。下位ビットではなく上位ビットを使うらしいです。

この時$k^{-1}$はqを法にした計算であることに注意してください。すなわち$(k^{-1} \times k)\bmod q = 1$となる整数です。この$k^{-1}$を求める方法もFIPS 186-4の中で付録として記載されています。

$$
\begin{aligned}
r &= (g^k \bmod p) \bmod q \\
s &= k^{-1}(z + xr) \bmod q
\end{aligned}
$$

## 署名の検証

署名の検証はFIPS 186-4だと5つの手順が記載されています。実際の検証作業は下記1., 2.となります。

ここで$M', r', s'$は、検証者が受け取った$M, r, s$です。

1. $r', s'$が1以上q未満であることを検証します
2. ステップ1が検証されたら、検証者は下記の計算を行います。この時$z$は$\mathbf{HASH}(M')$のbit列のうち上位の$\mathbf{min}(N, \mathbf{Hash}(M')\text{の長さ})$bitです。署名作成時と同じですね。
    $$ 
    \begin{aligned}
    w &= (s')^{-1} \bmod q \\
    u1 &= (zw) \bmod q \\
    u2 &= (r'w) \bmod q \\
    v &= ((g^{u1}y^{u2})\bmod p) \bmod q
    \end{aligned}
    $$
3. $v = r'$であれば署名が正しいと検証されます。$v = r'$でなければ署名は正しくなく、署名が変更されたか、署名の生成プロセスが誤っているか、偽物が署名を偽造したかのどれかとなります。

DH法やRSAと比べると式が多くてこれで本当に署名と検証ができるのか、パッと見てわかりませんね。

ちなみにここから分かることは、RSAのように署名したデータから原文を復元することは当然不可能です。

# 最後に

具体例がない。でもいいじゃない。