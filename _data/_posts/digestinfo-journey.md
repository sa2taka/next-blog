---
layout:      post
title:       DigestInfo とだけ言われた私への手向け歌
author:      sa2taka
category:    protocol
tags:        DigestInfo,ASN.1,DER,PKCS
public:      true
createdAt:   2021-04-01
updatedAt:   2021-07-06
latex:       true
description:
  DigestInfoとだけ書かれた仕様から始まる、様々な仕様を経由した色の濃い道程について記載します。  
---

ハローワールド

会社でプログラムを書いていたところ、とあるAPIの仕様書に

> DigestInfo

と書かれていた項目がありました[^specification]。

[^specification]: 正確に言うと、DigestInfoだけではないですが、仕様書の記載者がそのあたり理解していなかったためか、全く間違っていた記載がされていたため少しお茶を濁しています。

証明書関連の文脈上に出てくるAPIであることと、昔この単語を聞いた覚えがあったのもあり、証明書関連の単語であり、おそらく署名対象のデータを表すものであることはすぐに分かりました。

最終的には下記のバイト列(正確にはそれをBase64エンコードしたもの)を送るのが正解だったのですが、`DigestInfo`とだけ言われてから下記のバイト列まで行き着くまでの道程は非常に濃いものとなったため、今後似たような経験に遭遇した人たちのための標となることを祈って書き残し、私への手向けとします。

```
30 31 30 0d 06 09 60 86
48 01 65 03 04 02 01 05
00 04 20 2a f8 45 6a 33
37 19 04 86 e2 e0 12 26
87 fc 6f 99 63 08 df 58
98 8a 24 bb f0 36 7b 4d
1e 44 8d 
```

# ASN.1 との出会い

おもむろにGoogleの検索窓に`DigestInfo`と入力し検索すると、下記のような記法が目につくと思います。

```
DigestInfo ::= SEQUENCE {
     digestAlgorithm DigestAlgorithmIdentifier,
     digest Digest }
```

これは[RFC 2315 PKCS #7: Cryptographic Message Syntax Version 1.5](https://tools.ietf.org/html/rfc2315#section-9.4)[^rfc2315]に記載されています。

[^rfc2315]: https://tools.ietf.org/html/rfc2315

::: info
PKCS #7は公開鍵の標準を示したPKCS(Public-Key Cryptography Standards)の内、署名や暗号などに利用するデータの構文について記載された文章です。
:::

同Section内では触れられていませんが、これは**ASN.1** (Abstract Syntax Notation One)と呼ばれる記法です。ASN.1は既存のデータ型を用いて新たなデータ型を定義する記法で、PKCSでも全体に渡ってデータを表現するのに利用されています。ASN.1自体も現在は[X.680](https://www.itu.int/itu-t/recommendations/rec.aspx?rec=x.680)[^x.680]シリーズで定義されています。

[^x.680]: https://www.itu.int/itu-t/recommendations/rec.aspx?rec=x.680

ASN.1には基本の型があり、例えば可視可能文字列(PrintableString)や整数型(INTEGER)、後ほど出てきますが何もないことを表すNULL型(NULL)などがあります。上記の`DigestInfo`の定義で出てくる`SEQUENCE`も基本形であり、これは順序を持った複数の値(型)を表すものです。つまり、`DigestInfo`は`DigestAlgorithmIdentifier`という型の`digestAlgorithm`と`Digest`という型を持った`digest`が連続した値、ということを表しています。

では`DigestAlgorithmIdentifier`と`Digest`は一体何なんだと言うことです。どちらもX.680では規定されていないため、どこかに定義が記載されているはずです。

## Digest

幸い`Digest`に関してはRFC 2315内での上記の定義のすぐ下に記載があります。

```
Digest ::= OCTET STRING
```

`OCTET STRING`はX.680にも規定があり、簡単に言えばバイト列を表すものです。なのでDigestは単純なバイト列であることがわかります。  
当然、ただのバイト配列では駄目で、`digest is the result of the message-digesting process.`と記載されています。つまり**Digestはメッセージのハッシュ化した結果のバイト列**であることがここでわかります。

ちなみに、オクテットとは8bitのことであり(octoは8って意味ですね)、現在は事実上1byteと同じ意味です。昔は1byteが4bitだったり6bitだったり環境依存だったらしいので、8bitの固定長を表すのにオクテットが利用されていました。本記事では今後バイト(byte)と記載します。

## DigestAlgorithmIdentifier

問題は`DigestAlgorithmIdentifier`です。名前から察するにハッシュ化アルゴリズムの特定するIDであることは間違いなさそうです。

その定義を確認しようと検索をかけてみると、RFC2315内では[Section 6.3](https://tools.ietf.org/html/rfc2315#section-6.3)に

```
DigestAlgorithmIdentifier ::= AlgorithmIdentifier
```

と記載されています。結局`AlgorithmIdentifier`が何なのかという問題に移り変わっただけです。

[Section 3](https://tools.ietf.org/html/rfc2315#section-3)ではAlgorithmIdentifierの定義が記載されています。

> AlgorithmIdentifier: A type that identifies an algorithm (by object identifier) and associated parameters. This type is defined in X.509.

アルゴリズムのIDと関連パラメータを表すものらしいです。カッコの中に記載されている`object identifier`は後ほど現れてきます。  
結局定義はX.509でされているようですね。

ここではX.509ではなく、X.509の証明書などについて記載された[RFC5280](https://tools.ietf.org/html/rfc5280)[^RFC5280][^RFC5280-japanese]を確認してみます。

[^RFC5280]: https://tools.ietf.org/html/rfc5280
[^RFC5280-japanese]: RFC5280は有名なRFCの一つでもあるので、日本語訳も存在します。IPAからも出ているため(https://www.ipa.go.jp/security/rfc/RFC5280-00JA.html)こちらを読むのもいいでしょう。

[Section 4.1.1.2](https://tools.ietf.org/html/rfc5280#section-4.1.1.2)にビンゴな定義が記載されています。

```
AlgorithmIdentifier  ::=  SEQUENCE  {
        algorithm               OBJECT IDENTIFIER,
        parameters              ANY DEFINED BY algorithm OPTIONAL  }
```

`AlgorithmIdentifier`は`OBJECT IDENTIFIER`の`algorithm`と`algorithm`で定義されている`OPTIONAL`(省略可能)な`ANY`(何でも入れていい型)であることがわかります。`algorithm`はさておきとして、`parameter`はその名の通りアルゴリズムに指定するパラメーターなのでしょう。

さて`OBJECT IDENTIFIER`ですが、これはoidとも呼ばれるもので、ituが定めたオブジェクトを識別するためのIDのことを言っています。[Wikipediaの記事](https://ja.wikipedia.org/wiki/%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E8%AD%98%E5%88%A5%E5%AD%90)の記載が詳しいです。  
この`OBJECT IDENTIFIER`、実はX.680の定義にも記載があるため、基本の型の一つです。

今回はハッシュ化アルゴリズムを指定します。OIDでは、ハッシュ化アルゴリズムは`2.16.840.1.101.3.4.2`に定義されています。[OID Repository](http://oid-info.com/get/2.16.840.1.101.3.4.2)[^oidrepository]というサイトで検索してみると22個のハッシュ化アルゴリズムがあることがわかります。例えば、SHA256のOIDは`2.16.840.1.101.3.4.2.1`であることがわかります。

[^oidrepository]: http://oid-info.com

このドットで区切られた数字はそれぞれに意味があります。ASN.1で記載する場合は下記になりますが、それぞれの数字の意味がわかりやすいため、説明の代わりとします。

```
{joint-iso-itu-t(2) country(16) us(840) organization(1) gov(101) csor(3) nistAlgorithms(4) hashalgs(2) sha256(1)}
```

## ASN.1上でのDigestInfo

というわけで、ここまでくればDigestInfoが何を表しているのかはわかります。ASN.1記法で書くならこうなります。

```
DigestInfo ::= SEQUENCE {
     digestAlgorithm SEQUENCE  {
          algorithm   OBJECT IDENTIFIER,
          parameters  ANY DEFINED BY algorithm OPTIONAL  },
     digest OCTET STRING }
```

この時`algorithm`はハッシュアルゴリズムを指定します。例えばSHA256であれば`{joint-iso-itu-t(2) country(16) us(840) organization(1) gov(101) csor(3) nistAlgorithms(4) hashalgs(2) sha256(1)}`ということですね。そして、`digest`は、そのハッシュアルゴリズムでハッシュ化した値(署名対象データ)であることが必須です。

ここまで来ると`DigestInfo`がどういったデータなのかはわかったかと思います。

# ASN.1からDER(BER)への変換

ここまで来て何を送れば良いのかはわかりましたが、**どうやって送れば良いのか**、それに関しては仕様書には一切記載がありません。この仕様書だけでどうやって俺はデータを送れば良いんだよ。

幸いデータ例があったので、これは**DER**(正確にはBERかもしれない)で変換して送信することがわかりました。

## DER

証明書関連でPEMという言葉がよく出てきます。これは証明書のエンコーディングの一つです。このPEMは大体下記のような形式です。

``` plaintext:certificate.epm
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvKTZNwTucziHtmipgWRL
...
L9ZH1+DduRy2bextwOnBw0K+nSptpT8PDy6U24UO2PgIgh13evVmaznwp0hFig4B
dwIDAQAB
-----END PUBLIC KEY-----
```

この中身はBase64でエンコードされていますが、この元データはDERでエンコードされた証明書データです。そして、この証明書データはASN.1の形となっています。

**DER**はASN.1の形式で表記されたデータ構造をバイト列にエンコードするルールです。X.690ではASN.1のエンコードルールとして、BER, CER, DERについての定義がなされています。流石にプロダクションコードに自前のエンコーディングを入れるつもりはないので、詳しくは調べていないですが軽く説明を入れていきます。

ASN.1形式のデータをDERで変換する際、基本的にTAG + LENGTH + VALUEの3つのバイト列を連結して1つのデータを表します。

TAGというのは、ASN.1の型です。例えば`OCTET STRING`であればタグは`04`(16進数)です。また、`SEQUENCE`は、タグ自体は`10`(16進数)ですが、構造を持つ型なので、6bit目に1が立ちます。結果として、タグは`30`(16進数)となります。[ANS.1 のタグ一覧](https://tex2e.github.io/blog/protocol/ans1-tags)に全体がまとまっているため詳細はお任せいたします。

LENGTHはその名の通りVALUEの長さを表します。VALUEの長さが128byte未満であれば、LENGTHにはその数字が入ります。128byte以上であれば、まず1byte目にLENGTHを表すのに利用するbyteを記載し、2byte目以降にVALUEのLENGTHを記載します。その際最初のbyteのbit8を1とします。

VALUEは単純に値です。OCTET STRINGであれば単純にそのままバイト列となります。SEQUENCE等構造化データの場合は中身が更に別の値、つまりTAG + LENGTH + VALUEの形のデータとなります。

## DERで変換したoid

DigestInfoにはoidである`algorithm`があります。oidをDERで表現する時、ちょっと複雑な動きをします。

具体的には[C#でASN.1のObject Identifierのエンコードを行う](https://qiita.com/sukkyxp/items/69e142d07aa92aaa09c2#oid%E3%81%AE%E3%82%A8%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%89%E6%96%B9%E6%B3%95%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)に詳しいのですが、VALUEが素直にOIDをバイト列に直したものではないのです。

OIDは最初は必ず、0, 1, 2のどれかなので、最初の値に40(=0x28)をかけ(つまり1なら40, 2なら80)、そこにOIDの2つ目の値を足し合わせます。  
例えばSHA256のOIDの最初2つは`2.16`です。なので$2 * 40 + 16 = 96 = 0\text{x}60$となります。

また、SHA256ではOIDの中に840と128より大きな値があります。128より大きな値を記載する場合は、まず2進数で7bitごとに分割し、最後のbyteを除いてbit8の1を立てます。  
例えば840では7bitづつに分割して(0b00000110 0b01001000 = 0x06 0x48)、最後のbyte以外のbit8を立てる(0b10000110 0b01001000 = 0x86 0x48)ということなので、最終的には`86 48`となります。

それ以外は普通にバイトの値として組み合わせればいいので、SHA256を表すoid`2.16.840.1.101.3.4.2.1`はDERでエンコードすると`60 86 48 01 65 03 04 02 01`の9byteとなります。

oidはDERのTAGでは`06`に割り振られているので、合わせせると`06 09 60 86 48 01 65 03 04 02 01`というのがOIDを表すものです。

## DERで変換したDigestInfo

ここまで来たら怖いものはありません。知っている知識フル活用でもうDigestInfoをDERで変換してやれば良いのです。

今一度ASN.1でのDigestInfoを確認してみましょう。

```
DigestInfo ::= SEQUENCE {
     digestAlgorithm SEQUENCE  {
          algorithm   OBJECT IDENTIFIER,
          parameters  ANY DEFINED BY algorithm OPTIONAL  },
     digest OCTET STRING }
```

先程`algorithm`は作りました。`parameters`は`OPTIONAL`で不要でしょう(そしてこれが後ほど間違いとして時間をつぶすことになります)。

`SEQUENCE`のTAGは先程記載したとおり`30`です。そして中身は`algorithm`だけなのでVALUEの9byte + TAGとLENGTHの2byteで長さは11 = 0x0bです。なので`digestAlgorithm`は

```
30 0b (SEUQUENCE)
   06 09 (OID) 
      60 86 48 01 65 03 04 02 01
```

となります。

`digest`に関しては何でも良いので、今回は`digest test`という文字列をsha256でハッシュ化してみました。結果は`2af8456a3337190486e2e0122687fc6f996308df58988a24bbf0367b4d1e448d`です。

なので`digest`をDERで変換すると、OCTET STRINGのTAGは`04`で、LENGTHはSHA256なので当然256bit = 32byte = 0x20 byteなので`20`です。

よって`digest`をDERで変換すると下記となります。

```
04 20(OCTET STRING)
   2a f8 45 6a 33 37 19 04
   86 e2 e0 12 26 87 fc 6f
   99 63 08 df 58 98 8a 24
   bb f0 36 7b 4d 1e 44 8d
```

最後に全部組みわせます。SEQUENCEのTAGは`30`そして、LENGTHは41 = 0x29なので、

```
DigestInfo ::= SEQUENCE {
     digestAlgorithm SEQUENCE  {
          algorithm   OBJECT IDENTIFIER,
          parameters  ANY DEFINED BY algorithm OPTIONAL  },
     digest OCTET STRING }
```

は

```
30 29 (SEQUENCE)
   30 0b (SEUQUENCE)
      06 09 (OID) 
         60 86 48 01 65 03 04 02 01
   04 20 (OCTET STRING)
      2a f8 45 6a 33 37 19 04
      86 e2 e0 12 26 87 fc 6f
      99 63 08 df 58 98 8a 24
      bb f0 36 7b 4d 1e 44 8d
```

となります(実は違いました)。

## parametersの仕様

上記の値でテストを行ってみたところ何故か動かないのです。実は `digestAlgorithm` の `parameters` の指定に罠(自分で勝手に引っかかった)がありました。

実はPKCS #1のRFCである[RFC8017](https://tools.ietf.org/html/rfc8017#appendix-A.2.4)[^rfc8017]のAppendix A.2.4にはDigestInfoの定義が書いてあります。上記に記載されているものとは**異なります**。

[^rfc8017]: https://tools.ietf.org/html/rfc8017

```
DigestInfo ::= SEQUENCE {
    digestAlgorithm DigestAlgorithm,
    digest OCTET STRING
}

DigestAlgorithm ::= AlgorithmIdentifier {
   {PKCS1-v1-5DigestAlgorithms}
}

PKCS1-v1-5DigestAlgorithms    ALGORITHM-IDENTIFIER ::= {
    { OID id-md2 PARAMETERS NULL }|
    { OID id-md5 PARAMETERS NULL }|
    { OID id-sha1PARAMETERS NULL }|
    { OID id-sha224     PARAMETERS NULL }|
    { OID id-sha256     PARAMETERS NULL }|
    { OID id-sha384     PARAMETERS NULL }|
    { OID id-sha512     PARAMETERS NULL }|
    { OID id-sha512-224 PARAMETERS NULL }|
    { OID id-sha512-256 PARAMETERS NULL }
}
```

ここまで来たら、これぐらいのASN.1表記はスラスラ読めると思いますが、一番重要のは`OID id-sha256     PARAMETERS NULL`です。つまりこれは「**パラメータにnullをいれろ**」という記載です。

**ただし**その次には

>When id-sha1, id-sha224, id-sha256, id-sha384, id-sha512, id-sha512-224, and id-sha512-256 are used in an AlgorithmIdentifier, the parameters (which are optional) SHOULD be omitted, but if present, they SHALL have a value of type NULL. However, implementations MUST accept AlgorithmIdentifier values both without parameters and with NULL parameters.
>> AlgorithmIdentifier に id-sha1、id-sha224、id-sha256、id-sha384、id-sha512、id-sha512-224、id-sha512-256 を使用する場合、(オプションである) **パラメータは省略すべきである**（SHOULD）が、存在する場合は NULL タイプの値を持たなければならない(SHALL)。ただし、実装ではAlgorithmIdentifierの値を、**パラメータなしでもNULLパラメータ付きでも受け入れなければなりません**（MUST）。

と記載もあります(強調は筆者)。

::: warning
SHA2シリーズの暗号関連上での構文の定義が記載されている[RFC5754](https://tools.ietf.org/html/rfc5754#section-2)[^rfc5754]では、こんな記載があります。

>  Implementations MUST generate SHA2 AlgorithmIdentifiers with absent parameters.
> > 実装では、パラメータが存在しない SHA2 AlgorithmIdentifiers を生成しなければならない(MUST)。

しかし、その後の注意書きにこんな記載もあります。

> PKCS#1 [RFC3447] requires that the padding used for RSA signatures (EMSA-PKCS1-v1_5) MUST use SHA2 AlgorithmIdentifiers with NULL parameters (to clarify, the requirement "MUST generate SHA2 AlgorithmIdentifiers with absent parameters" in the previous paragraph does not apply to this padding)
> > PKCS#1 [RFC3447]では(訳注: RFC8017の前身のRFC)、RSA署名(EMSA-PKCS1-v1_5)に使用するパディングは、NULLパラメータを持つSHA2 AlgorithmIdentifiersを使用しなければならないと規定されています(明確にするために、前項の「MUST generate SHA2 AlgorithmIdentifiers with absent parameters」という要件は、このパディングには適用されません)。

様々なRFCでふわっふわした定義となっていますが、APIの利用者的にはRFCがどうこうというよりかは、最終的にAPIの挙動次第となっていまいますね。上記RFCではざっくり歴史的な経緯によりこうなっていると記載があるので、時間が解決してくれる問題かもしれません。
:::

[^rfc5754]: https://tools.ietf.org/html/rfc5754

RFC的には入れても入れなくても問題はないようですが、結局動かないものは動かないのでparameterにNULLを入れて送らなければならないようです。

nullと空では、実はDER形式では少し異なります。 DER形式ではNULL型という型があります。TAGは`05`、通常はLENGTHを`00`(つまりVALUEが空のデータ)として表現するようです。

## 最終的なDERで変換したDigestInfo

よって`parameter`に`05 00`が入り、それでLENGTHが多少変わるので

```
DigestInfo ::= SEQUENCE {
     digestAlgorithm SEQUENCE  {
          algorithm   OBJECT IDENTIFIER,
          parameters  ANY DEFINED BY algorithm OPTIONAL  },
     digest OCTET STRING }
```

は

```
30 31 (SEQUENCE)
   30 0d (SEUQUENCE)
      06 09 (OID) 
         60 86 48 01 65 03 04 02 01
      05 00 (NULL)
   04 20 (OCTET STRING)
      2a f8 45 6a 33 37 19 04
      86 e2 e0 12 26 87 fc 6f
      99 63 08 df 58 98 8a 24
      bb f0 36 7b 4d 1e 44 8d
```

となりました。これは最初に提示したバイト列と同じです。

# さいごに

DigestInfoという単語(とたった一つのデータ例)から正しいデータ列をいつでも生成する力を手に入れることができました。
こういった証明書やPKIなどでは、RFCやX.509などの定義を参照していればほぼ問題がないと思っていましたが、今回の例のように歴史的な経緯が買ったり、またバージョンによって大幅な転換があったりと、一筋縄では決して行かない難しさを感じました。

とはいえ、ASN.1やDERといった知識はこういった部分では必須知識と考えて問題はないと思います。詳しく知ることができたこの(余り親切ではない)設計書に感謝ですね。

# 参考文献

- [RFC2315](https://tools.ietf.org/html/rfc2315)
- [RFC5280](https://tools.ietf.org/html/rfc5280)
- [オブジェクト識別子 - Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E8%AD%98%E5%88%A5%E5%AD%90)
- [抽象記法](http://www5d.biglobe.ne.jp/stssk/asn1/basic.html)
- [ANS.1 のタグ一覧 | 晴耕雨読](https://tex2e.github.io/blog/protocol/ans1-tags)
- [C#でASN.1のObject Identifierのエンコードを行う - Qiita](https://qiita.com/sukkyxp/items/69e142d07aa92aaa09c2#3%E3%83%90%E3%82%A4%E3%83%88%E7%9B%AE%E4%BB%A5%E9%99%8D2b-06-01-02-01-01-05%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)
- [rfc8017](https://tools.ietf.org/html/rfc8017)
- [rfc5754](https://tools.ietf.org/html/rfc5754)
