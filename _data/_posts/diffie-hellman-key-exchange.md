---
layout:      post
title:       DH法についてそれなりに力を入れて調べてみたら
author:      sa2taka
category:    cipher
tags:        cipher,公開鍵
public:      true
createdAt:   2020-10-25
updatedAt:   2021-07-13
latex:       true
description:
  鍵交換法、というと必ず出てくるDH法。今回はちょっとだけ詳しく調べてみました。  
---

いつでも同じところに行き着くのさ（共通鍵）

ハローワールド。

鍵交換法、というと必ず出てくるDH法。今回はちょっとだけ詳しく調べてみました。

# DH法について

Diffie-Hellman鍵共有法（DH法）は1976のWhitfield DiffieとMartin Edward Hellmanによる論文、“New directions in cryptography”で提案された鍵交換の実装方法の1つです。
直訳すると「新しい暗号の方向性」といった感じです。当該論文で実現したかったことは論文の概要に記載があります。

> Widening applications of teleprocessing have given rise to a need for new types of cryptographic systems, which minimize the need for secure key distribution channels and supply the equivalent of a written signature.
> > 遠隔処理の適用範囲が広がる中で、安全な鍵の流通経路の必要性を最小限に抑え、書面による署名に相当するものを提供する新しいタイプの暗号システムが必要とされている。

当時は、当然ながら公開鍵暗号方式というものはないので、共通鍵暗号で暗号化を行っていたと考えられます。
よくDH法の背景として語られる「非セキュアな環境での共通鍵の配送問題」ですが、当時の唯一の解決法は"secure key distribution channels"が有り、そこで共通鍵を受け渡していたという感じでしょうか。[^secure-key-distribution-channels]。

[^secure-key-distribution-channels]: 実際に論文内では書留などの物理的な手段での共通鍵の配送が主だった様子が示唆されています。

"supply the equivalent of a written signature"については論文を読むと"one-way functions"、つまり一方向性関数のことについて示唆しています[^one-way_functions]。
また、そこから秘密鍵でメッセージを「復号」し、公開鍵で受け取ったメッセージを「暗号化」することで「真の一方向性関数」を生成できるという記載もあります。残念ながらDH法には其の機能はないですが。

[^one-way_functions]: 具体的にはKerberos認証でも有名な[R.M Needham](https://en.wikipedia.org/wiki/Roger_Needham)について記載があります。彼は今では当たり前であるパスワードのハッシュ関数によって保護する手段についてのパイオニアらしく（リンク先Wikipediaより）、 彼の作ったログインシステムを例示しています。

いろいろな場所で聞いた事があるかもしれないですが、**DH法が解決したい**のは「**非セキュアな環境でのセキュアな鍵の配送**」、具体的には「**通信チャネルが盗聴されている場合の安全な共通鍵の配送**」を達成したかったものですね（実際にはもう1つ署名に相当するものの提供もあります）。

# DH法の鍵交換方法

DH法は[RFC2631](https://datatracker.ietf.org/doc/html/rfc2631)"Diffie-Hellman Key Agreement Method"([日本語訳](https://www.ipa.go.jp/security/rfc/RFC2631JA.html))などに記載がありますが、DH法以外の部分の式も色々と記載があります。今回はとりあえずDH法の核となる部分のみ記載します。

DHで利用するパラメータは下記となります。ここで$K$が最終的に交換された鍵となります。

$$\begin{aligned}
K &: \text{共通鍵（SharedSecret）}\\
S_A &: \text{Aの秘密鍵} \\
S_B &: \text{Bの秘密鍵} \\
P_A &: \text{Aの公開鍵} \\
P_B &: \text{Bの公開鍵} \\
p &: \text{十分大きな素数} \\
g &: \text{任意の自然数}
\end{aligned}$$

A(lice)さんとB(ob)さんはお互いに非セキュアな通信経路でお互いのみが知りうる事のできる共通鍵を作ろうと思い、DH法を利用することにしました。
まずは、秘密鍵$P_A, P_B$を生成します。この時、$2 \leqq P_{A, B} < p$となるように生成します。

そして下記の計算でお互い$K$を獲得します。ただし、$a \bmod b$は剰余、つまり$a$を$b$で割った余りを求める計算です。

Alice: 
$$
\begin{aligned}
P_A &= g ^ {S_A} \bmod p \\
K &= P_B ^ {S_A} \bmod p \\
&=  g ^ {S_A * S_B} \bmod p
\end{aligned}
$$

Bob:
$$
\begin{aligned}
P_A &= g ^ {S_A} \bmod p \\
K &= P_B ^ {S_A} \bmod p \\
&=  g ^ {S_A * S_B} \bmod p
\end{aligned}
$$

よく言われるのが$S_{A, B}$がバレなければ$K$は求められないというものです。つまりこれらのパラメータのうち$P_A, P_B, g, p$はバレても全然問題ないという夢のような方法です。

因みに[RFC3526](https://datatracker.ietf.org/doc/html/rfc3526)におおよそ代表的な$p$の値がまとまってます。これらはIPSECの[IKE(RFC2409)](https://tools.ietf.org/html/rfc2409)プロトコルで利用されるものであり、IKE（そしてDH全般）では$g$は大体2が使われていると記載があります[^g-is-2]。SSHの場合は[Diffie-Hellman鍵交換入門](https://qiita.com/okajima/items/036d7e751234f88fbe9a)に記載されていますが、$g = 2$とし$p$も固定の値を利用しているらしいです。

[^g-is-2]: IKEではなく、その前身となったOrcleyプロトコル（RFC2412）のAppendix.Aにそのような記載があります[https://tools.ietf.org/html/rfc2412#appendix-A](https://tools.ietf.org/html/rfc2412#appendix-A)

## 具体例

具体的な値を入れ込んで見てみます。

DH法は$p$の値が大きければ大きいほど安全となりますが、ここでは$p$は小さな値にしてみます。
具体的に下記のパラメータで計算してみます。

$$
\begin{aligned}
S_A &= 22 \\
S_B &= 80 \\
g &= 2 \\
p &= 163 \\
P_A &= g ^ {S_A} \bmod p \\
&= 2 ^ {22} \bmod 163 \\
&= 151\\
P_B &= g ^ {S_B} \bmod p \\
&= 2 ^ {80} \bmod 163 \\
&= 81
\end{aligned}
$$

そしてお互いの$P_A, P_B$を交換し、AliceとBobでそれぞれ$K_A, K_B$を計算しましょう。

$$
\begin{aligned}
K_A &= P_B ^ {S_A} \bmod p \\
    &= 82 ^ {22} \bmod 163 \\
    &= 95 \\
K_B &= P_A ^ {S_B} \bmod p \\
    &= 151 ^ {80} \bmod 163 \\
    &= 95\\
K &=  g ^ {S_A * S_B} \bmod p \\
&= 2^{22 * 80} \bmod 163 \\
&= 95 \\
K_A = K_B = K &= 95
\end{aligned}
$$

すごい（小並感）。

# 最後に

上記の計算をいろいろな値で試すことのできるサイトを作ってみました。

https://sa2taka.github.io/dh-viewer/

  2, 3時間で作ったので完成度はかなりアレですが。
