---
layout:      post
title:       Chromeで使える証明書の作成方法
author:      sa2taka
category:    memo
tags:        証明書
public:      true
createdAt:   2021-07-05
updatedAt:   2021-07-05
latex:       false
description:
  Firefoxでは動くけどChromeでは動かない証明書が完成したので直しました。SANが重要だそうです。  
---

ハローワールド

本記事では**Chromeで使える**サーバー証明書を作成します。

もし、Firefoxでは動くのにChromeで動かない証明書を作って困ってこの記事を見つけた方は[Chromeでも動く証明書を作成する](#Chromeでも動く証明書を作成する)へ行きましょう。

# 環境

Windows20H2上のWSL2(Ubuntu 20.04 LTS)上のopensslを利用します。

```sh
$ openssl version
OpenSSL 1.1.1f  31 Mar 2020
```

# 事前準備

証明書を作成する前にいくつか事前準備を行います。

まず証明書を配置するフォルダを作成しましょう。

```sh
$ mkdir certification_test
```

今後はこのフォルダを基点として説明していきます。

## httpsサーバー
また、chromeでちゃんと動くか確認するため、httpsサーバーも用意します。httpsのサーバーはnode.jsで簡易的に実装しました。

```javascript:index.js
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.crt");

https
  .createServer(
    {
      cert: certificate,
      key: privateKey,
    },
    (req, res) => {
      res.writeHead(200);
      res.write("<h1>Hello, World!</h1>");
      res.end();
    }
  )
  .listen(1443);
```

同じフォルダに`server.key`, `server.crt`を配置して実行すればそれらの証明書を利用したHTTPSサーバーが建ちます。これを利用しましょう。

## hostsの変更

IPに対する証明書の発行は難しいので、URL(サーバーのFQDN)に対する証明書を発行したいですが、そうすると今度はURLとIPアドレスを誰も紐付けてくれません。

そのため、今回はhostsを利用します。今回受け側はWindowsなので、`C:\Windows\System32\drivers\etc\hosts`を編集します。**管理者権限が必要であり、更には重要なファイルなので自己責任で編集を行ってください**。

管理者権限で編集する必要があります。スタートボタンの検索窓で「メモ帳」を検索して、右クリックから管理者で実行し、上のフォルダへいきhostsを選択れば(デフォルトでは.txtでフィルターが掛かっているので、全てのファイルに変更すること)、編集が可能です。

後は下記のように編集しましょう(FQDNを`test.sa2taka.com`とする場合)

``` plaintext:hosts
...(中略)
127.0.0.1 test.sa2taka.com
```

:::warning
**WSL2を利用している場合**、`localhost`でアクセスするといい感じにWSL2の方へフォワーディングしてくれますが、それ以外のFQDNでアクセスされるとアクセスできません。これはWSL2のアーキテクチャが完全にWindowsからホストレベルで分離していることから起因しています。

なので、上記のやり方ではWSL2では動きません。そのため、まずはWSL2のホストのIPアドレスを取得し、hostsではそのIPアドレスを指定して上げる必要があります。Ubuntu 20.04の場合`ip address`コマンドでipが取得可能です。

``` sh
$ ip address
...(中略)
4: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:15:5d:dc:9f:f4 brd ff:ff:ff:ff:ff:ff
    inet 172.29.103.144/20 brd 172.29.111.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::215:5dff:fedc:9ff4/64 scope 
(略)
```

上記の`172.29.103.144`がIPアドレスなので、それをhostsに書いてあげましょう。

``` plaintext:hosts
...(中略)
172.29.103.144 test.sa2taka.com
```

このIPは再起動するたびに入れ替わるので、再起動した場合は毎回確認してください。
:::

# 証明書の作成

事前準備も完了したので、証明書を作成していきます。

## ルート証明書

ルート証明書、別名自己署名証明書を作成します。

1. 秘密鍵の作成
```bash
$  openssl genrsa 4096 > root.key
```
2. 署名要求ファイルの作成。途中で入力する値は任意です
```bash
$ openssl req -new -sha256 -key root.key -out root.csr
(中略)
Country Name (2 letter code) [AU]:jp
State or Province Name (full name) [Some-State]:sa2taka
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:sa2taka
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:sa2taka_root
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```
3. **自己**署名
```bash
$ openssl x509 -req -in root.csr -signkey root.key -days 3650 -out root.crt
```

## CAフォルダ

opensslはCA(認証局)に簡単になれる機能が存在します。そのためにはいくつかフォルダを作成する必要があります。

```bash
$ cat /etc/ssl/openssl.cnf  | grep dir -n3
...(中略)
43-[ CA_default ]
44-
45:dir          = ./demoCA              # Where everything is kept
46:certs                = $dir/certs            # Where the issued certs are kept
47:crl_dir              = $dir/crl              # Where the issued crl are kept
48:database     = $dir/index.txt        # database index file.
49-#unique_subject      = no                    # Set to 'no' to allow creation of
50-                                     # several certs with same subject.
51:new_certs_dir        = $dir/newcerts         # default place for new certs.
52-
53:certificate  = $dir/cacert.pem       # The CA certificate
54:serial               = $dir/serial           # The current serial number
55:crlnumber    = $dir/crlnumber        # the current crl number
56-                                     # must be commented out to leave a V1 CRL
57:crl          = $dir/crl.pem          # The current CRL
58:private_key  = $dir/private/cakey.pem# The private key
```

デフォルトだとこんな感じだと思います。

上記に合わせてフォルダやファイルを作成していきます。ちなみに`./`はopenssl実行フォルダを表し`/etc/ssl/`を表すわけではありません。なので任意のフォルダで問題ありません。

```bash
# 45行目 dir
$ mkdir demoCA
# 46行目 cersts
$ mkdir demoCA/certs
# 47行目 crl_dir
$ mkdir demoCA/crl
# 48行目 database
$ touch ./demoCA/index.txt
# 51行目 new_certs_dir
$ mkdir demoCA/newcerts
# 53行目 certificate
$ cp root.crt demoCA/cacert.pem
# 54行目 serial
$ echo 01 > ./demoCA/serial
# 58行目 private_key
$ mkdir demoCA/private
$ cp root.key demoCA/private/cakey.pem
```

## サーバー証明書

続いてサーバー証明書を作っていきます。これが実際にhttpsサーバーで利用する証明書と秘密鍵です。

1. 秘密鍵の作成
```bash
$  openssl genrsa 4096 > server.key
```
2. 署名要求ファイルの作成。Common NameはFQDNにしておくのがいいでしょう。
```bash
$ openssl req -new -sha256 -key server.key -out server.csr
(中略)
Country Name (2 letter code) [AU]:jp
State or Province Name (full name) [Some-State]:sa2taka
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:sa2taka
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:test.sa2taka.com
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```
3. CAで署名(openssl x509ではなくcaを利用する)
```bash
$ openssl ca -in server.csr -out server.crt
(中略)
Sign the certificate? [y/n]: 
1 out of 1 certificate requests certified, commit? [y/n]y
Write out database with 1 new entries
Data Base Updated
```

### 試してみる

できたてほやほやの証明書を使ってhttpsサーバーを立ててアクセスしてみます。

![ルート証明書認証前](https://images.ctfassets.net/xw0ljpdch9v4/4i8MZX9x58MAAQLurDDpgr/ab4a28edc321f7c2ea4c2a55902d9855/image.png)

ルート証明書を登録していないので当然エラーになります。なのでルート証明書をインストールしましょう。Windowsではcrtファイルをダブルクリックして、信頼されたルート証明機関を選択してインストールするだけです[^wsl-folder]。

[^wsl-folder]: WSLのフォルダはエクスプローラーのアドレスバーに`wsl$`と入力するとアクセスできます。

では、アクセスしてみると...**あれ、動きませんね。**

でも、**Firefoxでは動きます**[^firefox-certificate]。IEでも動きます。

[^firefox-certificate]: FirefoxはOSと証明書が分離されているので、別途証明書を設定からインポートしてください

![Firefoxでは動く](https://images.ctfassets.net/xw0ljpdch9v4/1OSKH9b9yL0DHYdl9q8QB1/9350584e3f936d6a7840944e3de1901b/image.png)

ブラウザによって挙動が変化するんですね。

## Chromeでも動く証明書を作成する

Webブラウザが証明書とURLをどうやって紐付けていると、元来「Common Name」という項目を見ていました。本証明書でも`test.sa2taka.com`が載っています。下記の`CN`がそれですね。

```bash
$ openssl x509 -in server.crt -noout -subject
subject=C = jp, ST = sa2taka, O = sa2taka, CN = test.sa2taka.com
```

しかしChromeではCommon Nameを見なくなりました。[Chrome 58での非推奨・削除項目](https://developers.google.com/web/updates/2017/03/chrome-58-deprecations#remove_support_for_commonname_matching_in_certificates)(2017年!)を見ると、下記のようないくつかの理由でCommonNameを見なくなりました。

- commonNameへのフォールバックは[RFC2818](https://datatracker.ietf.org/doc/html/rfc2818)[^rfc2818] (2000年(!)発行)で非推奨とされている[^rfc2818-deprecated]
- commonNameは曖昧であるため、脆弱性の原因となっている
- commonNameを削除することによる互換性のリスクは低い

[^rfc2818]: https://datatracker.ietf.org/doc/html/rfc2818
[^rfc2818-deprecated]: > Although the use of the Common Name is existing practice, it is deprecated and Certification Authorities are encouraged to use the dNSName instead. 
    >> Common Name の使用は既存の慣行であるが、これは非推奨であり、認証局は代わりに dNSName の利用を推奨する
    encourage: 励ます、勧める、推奨する

では何を見るのか? 上記のブログにも記載はありますが、`subjectAlternativeName`(通称SAN)を見ます。

### 証明書の新規作成

というわけで証明書にSANを追加してあげれば良さそうです。

SANはいわゆるv3 extensionsであり、手っ取り早く追加するには下記の方法でいけます。

1. 下記のファイルを用意します。`san.txt`と名付けておきます。
```plaintext:san.txt
subjectAltName = DNS:test.sa2taka.com
```

2. openssl caをやるときに邪魔になるファイルを消します。
```bash
$ rm demoCA/index.txt
$ touch demoCA/index.txt
```

3. 証明書作成する
```bash
$ openssl ca -in server.csr -out server.crt -extfile san.txt
```

証明書を確認すると、ちゃんとSANが設定されていますね。

```bash
$ openssl x509 -in server.crt -noout  -text | grep Alt -1
        X509v3 extensions:
            X509v3 Subject Alternative Name:
                DNS:test.sa2taka.com
```

これで晴れてChromeでも動作するようになりました。

![Chromeでも動くように](https://images.ctfassets.net/xw0ljpdch9v4/2XRVaYushELoaMHeOF8EHe/07edb01b0881b30a36b612137bdd2fff/image.png)
