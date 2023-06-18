---
layout:      post
title:       サーバーサイド言語としてのJVM言語について調べてみた
author:      sa2taka
category:    programming
tags:        Java,Scala,Kotlin,JVM,Server,Web,Spring,Spring Boot,Play Framework,Ktor,HTTP4K
public:      true
createdAt:   2020-05-03
updatedAt:   2021-04-20
latex:       undefined
description:
  Java、Scala、Kotlin。JVM上で動く言語の3つ。特にJavaとKotlinはAndroidで利用することが多いでしょう。ではこれらの言語、サーバーサイドでは一体どのようなフレームワークがあるのか、気になったので調べてみました。  
---

ハローワールド。

サーバーサイドで動く言語、といえば何でしょうか。私であればRubyと考えるでしょうし、PHPと考える人も多いでしょう。
今回はサーバーサイドで動くJVM言語を調べてみました。一応JVM上で動く言語をJVM言語と読んでいますが、今回調べるのはJava、Scala、Kotlinの3つ。どういったフレームワークがあるか、どういった利用例があるかといった点を調べて行きたいと思います。

# 背景

サーバーサイドで動くJVM言語。ってどんなのがあるのか探して、自分に合うものを探したかったから。

# おことわり

私、Javaを始めとしたJVM言語に関してほっとんど書いたことがないので、そのあたり怪しい部分があると思いますが、何卒ご了承ください。

# Java

説明するほどもないですが、いまやオブジェクト指向言語の代名詞とも呼ばれる存在です。25年前（年上ですね）に誕生してから、Java Applet、Java Servletから始まり、Android、JavaFXと様々な世界を広げました［要検証］。世界一使われている言語の1つと行っても過言ではない言語でしょう。

一時期Webの脆弱性診断していたのですが、診断したサーバーサイドの言語としてはPHPとJavaの二択といった状況でした。もちろん企業のバックエンドによるのでしょうが、やはりサーバーサイドといえばPHPとJavaの二択なんだなと感じました。

## Javaのサーバーサイド

JavaでサーバーサイドといえばJava ServletとJSP、あとTomcatでカリカリと書いている印象が僕の中で割とあります。まぁ、最近ではフレームワーク、おそらくSpringをバリバリ利用している例が多いと想像できますが。あるいはセキュリティ的によく話題になるApache Strutsを利用するのでしょうか（Apache Struts2を使ってるところ、あんまりみたことないですけど）。
もちろん様々なフレームワークがありますが、おそらくJavaでサーバーサイドというならJava Servletでカリカリ、もしくはSpringを利用する例が多いのかと存じます。（JavaServer Faces? 知らない子ですね）

ちなみにPlay Frameworkは[Scala](#Scala)の章で詳しく記載するつもりです。

## Java Servlet

Java ServletはJavaのエンタープライズ向けAPI仕様であるJavaEE(Jakarta EE?)の一機能です。おそらく。

Wikipedia（https://ja.wikipedia.org/wiki/Java_Servlet）を参照すると、MVCアーキテクチャの図が載っています。おそらくアーキテクチャに依存はしていないのでしょうが、ControllerをServlet、ViewをJSP、ModelをJava Beansが携わる形が多いということでしょうか。

コードの例示などは行いませんが、今から始めようと思ってこの形を採用することはないと思うので、今回はご紹介まで（公式、と呼べる文章を探し出せなかったのは秘密）。

## Spring

[Spring](https://spring.io)はJava(正確に言うとJVM言語全般？)のフレームワークです。ちなみにSpringといっていますが、ここで紹介するのはほとんどSpring Bootに関することです。

> Spring makes programming Java quicker, easier, and safer for everybody. Spring’s focus on speed, simplicity, and productivity has made it the world's most popular Java framework.
> > Springは、Javaのプログラミングをより速く、より簡単に、より安全にします。Springはスピード、シンプルさ、生産性に重点を置いているため、世界で最も人気のあるJavaフレームワークとなっています。

私はSpringはWebのフレームワークだと思ってましたが、Microservice、Reactive、Cloud、Web App、Serverless、Event Driven、Batchと多岐に渡るようですね。

私、全然Springのこと知らない！ということに気づいてしまいました。では、習うより慣れろの格言に従い、まずはプロジェクトを実行してみましょう。そんなのどうでもいいという方は[Springとは?](#Springとは?) 項を見ていただければ。

### Getting Started!

というわけで試してみましょう。[こちら](https://spring.io/quickstart)に沿って作業を始めていきます。

ただ、その前にjavaのインストール。詳しい手順は適当に調べて見てください。

```sh
$ java -version
openjdk version "14.0.1" 2020-04-14
OpenJDK Runtime Environment (build 14.0.1+7)
OpenJDK 64-Bit Server VM (build 14.0.1+7, mixed mode, sharing)
```

OpenJDKの14を入れてみました。ちなみにOSは`macOS 10.15.4`です。

次に[Spring Initializr](https://start.spring.io/)（initialzerの誤字ではないです）でSpringの初期プロジェクトを作ってみます。

設定項目は
- Project（MavenがGradleか）
- Language
- Spring Bootのバージョン
- Projectのメタデータ
- Packaging(jarかwar?)
- Javaのバージョン
- Dependencies（ライブラリ）

です。SpringはJava以外にもScala、Kotlinでも利用できるようで、Languageではそれぞれの言語を選択できます。それぞれの言語で紹介しますので、ここではここまでにしておきます。

Projectはいわばビルドツールですね。JavaScriptでいうWebpackのようなものでしょうか。大御所であるMavenとGradleを選択可能です。どちらがいい、といった知識は私はないので今回はMavenを利用していこうと思います。実際に使おうと思った場合にはどちらがいいか、というのを考えて行きたいと思います。

jarとwar。jarは聞いたことありますが、warってなんですか。-> Web application ARchive。ふぅん。

一応基本的に全部デフォルトで選択してgenerateしましょう。今回はdemo.zipがダウンロードされるので開いてみましょう。

### 実行、しかし...

プロジェクトに移動して実行してみましょう

```sh
mvn spring-boot:run                                                
[INFO] Scanning for projects...
[INFO] 
[INFO] --------------------------&lt; com.example:demo >--------------------------
[INFO] Building demo 0.0.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO] 
[INFO] >>> spring-boot-maven-plugin:2.2.6.RELEASE:run (default-cli) > test-compile @ demo >>>
[INFO] 
[INFO] --- maven-resources-plugin:3.1.0:resources (default-resources) @ demo ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 1 resource
[INFO] Copying 0 resource
[INFO] 
[INFO] --- maven-compiler-plugin:3.8.1:compile (default-compile) @ demo ---
[INFO] Nothing to compile - all classes are up to date
[INFO] 
[INFO] --- maven-resources-plugin:3.1.0:testResources (default-testResources) @ demo ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] skip non existing resourceDirectory /Users/t0p_l1ght/projects/javaSprintDemo/src/test/resources
[INFO] 
[INFO] --- maven-compiler-plugin:3.8.1:testCompile (default-testCompile) @ demo ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 1 source file to /Users/t0p_l1ght/projects/javaSprintDemo/target/test-classes
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.018 s
[INFO] Finished at: 2020-05-02T23:01:28+09:00
[INFO] ------------------------------------------------------------------------
[ERROR] Failed to execute goal org.apache.maven.plugins:maven-compiler-plugin:3.8.1:testCompile (default-testCompile) on project demo: Fatal error compiling: エラー: 14は無効なターゲット・リリースです -> [Help 1]
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/MojoExecutionException
```

なんか失敗しました。

と思ったら、今回見てたのはWebのチュートリアルだったようで、dependeciesにwebのライブラリが入ってなかったようです。

``` xml:pom.xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
+        <artifactId>spring-boot-starter-web</artifactId>
-        <artifactId>spring-boot-starter-starter</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
        <exclusions>
            <exclusion>
                <groupId>org.junit.vintage</groupId>
                <artifactId>junit-vintage-engine</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
</dependencies>
```

今度はいけるだろう...と思ったがまたエラー

```
エラー: メイン・クラスcom.example.demo.DemoApplicationのロード中にLinkageErrorが発生しました
        java.lang.UnsupportedClassVersionError: com/example/demo/DemoApplication has been compiled by a more recent version of the Java Runtime (class file version 58.0), this version of the Java Runtime only recognizes class file versions up to 57.0
```

おそらくjavaのランタイムとコンパイルのバージョンが異なるからなのでしょう...多分。

```
Fatal error compiling: エラー: 14は無効なターゲット・リリースです -> [Help 1]
```

こんなエラーも出ました。おそらくバージョン14をターゲットにしたリリースはできないということなのでしょうか。

実はmvnって内部にjavaのランタイムを持っているのでは、と思いバージョン情報を見てみることに。

```
$ mvn -version
Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
Maven home: /usr/local/Cellar/maven/3.6.3_1/libexec
Java version: 13.0.2, vendor: N/A, runtime: /usr/local/Cellar/openjdk/13.0.2+8_2/libexec/openjdk.jdk/Contents/Home
Default locale: ja_JP, platform encoding: UTF-8
OS name: "mac os x", version: "10.15.4", arch: "x86_64", family: "mac"
```

javaのバージョンが13.0.2って書いてありますね。
なのでJAVA_HOMEを設定してあげて適切な設定にしてあげましょう。

私はfishを使っているのでこう。

``` sh:fish.config
set -x JAVA_HOME (/usr/libexec/java_home -v 14)
```

bash等の場合はこうでしょうね。

``` sh:bash_profile
export JAVA_HOME=`/usr/libexec/java_home -v 14`
```

というわけで、これで無事にmavenのjavaのバージョンが元通りになりました。

```
$ mvn -version
Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
Maven home: /usr/local/Cellar/maven/3.6.3_1/libexec
Java version: 14.0.1, vendor: Oracle Corporation, runtime: /Library/Java/JavaVirtualMachines/jdk-14.0.1.jdk/Contents/Home
Default locale: ja_JP, platform encoding: UTF-8
OS name: "mac os x", version: "10.15.4", arch: "x86_64", family: "mac"
```

### エラーを解消して再実行

```
$ mvn spring-boot:run 
(中略)
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.2.6.RELEASE)
```

![HelloWorld with java-spring](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/HelloWorld%20with%20java-spring.png)

なるほど。

ここで、アプリケーションの実行ファイルを見てみましょう。

```java:DemoApplication.java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class DemoApplication {

  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }

  @GetMapping("/hello")
  public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
    return String.format("Hello %s!", name);
  }
}

```

`main`メソッドはおそらく「おまじない」の類のものだと考えて、おそらくここで気にかけるべきは`@RestController`アノテーション、`@GetMapping`アノテーションでしょう。
`@RestController`アノテーションのあるクラスがコントローラーで、`@GetMapping`がパスを表していることは見て取れます。
また、`@RequestParam`で受け取っているのがおそらくクエリストリングでしょう。

試しに`name=sa2taka`というクエリストリングをつけてみると、たしかに表示が変わりました。

![Hello sa2taka with java-spring](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Hello%20sa2taka%20with%20java-spring.png)

### Springとは? 

ここで僕が思っていたSpring Frameworkと実際のSpringが大きくかけ離れていたことを知りました。

[Overview](https://docs.spring.io/spring-framework/docs/5.2.6.RELEASE/spring-framework-reference/overview.html#overview)にあるように

> The Spring Framework is divided into modules.
> > Springフレームワークは複数のモジュールに分かれています

具体的にはOverviewの中身を読んでいただきたいのですが、Springは、RubyにおけるRuby on Rails、PHPにおけるLarabelのようにWebフレームワーク、というものではなく複数のコンポーネントの集合体であるということがわかります。

つまり今回は、Springフレームワークの中のWebというコンポーネントを使ってRESTコントローラーを実現した、ということになります。
この背景には上記OverviewにもあるようにJ2EEの複雑さへ対応するために完成したもの、という歴史があるため、フレームワークの中に様々な機能を持っているということなのでしょうか。

歴史が関わってくると急に面白くなってしまいますが、一旦ここで調査は打ち切りです。なぜなら最初からJavaはやる気が無いので。

# Scala

[Scala](https://www.scala-lang.org/)はオブジェクト指向であり、かつ関数型言語でもあるという特徴がある結構特殊な言語です。

よく話に聞く最大の特徴の1つとして、実行時エラーを出しにくい（あるいは、開発者が実行時エラーを出さないような注意を払ってプログラムを書くともいう）言語、というのがあります。触ったこともない人間がこんな紹介をするのもなんですが。

## Scalaのサーバーサイド

Scalaで有名なサーバーサイドの話といえば、TwitterがScalaで実装されているという話があります[^twitter-scala]。

[^twitter-scala]: TwitterはもともとRuby on Railsで作られていましたが、Twitterのリアルタイム処理という部分に関してRuby on Rails、ひいてはRubyでは耐えられないほどになったことで、JVMへ移行したという話があります（https://www.youtube.com/watch?v=ohHdZXnsNi8）。

そんなScala、先程紹介したようにSpringフレームワークも使えますが、ここではPlay Frameworkについて調べてみました。

## Play Framework

[Play Framework](https://www.playframework.com/)はJavaのサーバーフレームワークの1つなのですが、Scalaでは最も人気のあるフレームワークの1つです（もちろんJavaでも人気フレームワークの1つです、多分）。

Play Frameworkに関する要点をまとめると下記のようになります。

- （Spring Boot誕生前のSpringやJ2EEに比べて）簡単で独自性の高いWebフレームワークとして誕生
- Play Framework 2系はScalaによって書かれている

Springと同じように歴史があり、PlayFrameworkはWebフレームワークが求められた中で生まれ、またScalaのコミュニティといち早くマッチしたというのが特徴です。PlayFrameworkはもちろんJavaでも利用できますが、Scalaを書いている人たちが作っているフレームワークなので、当然Scalaとの親和性が高いということでしょう。
加えてJ2EEの問題を解決しようとしたSpringと違いRuby on RailsなどのWebフレームワークを目指して作られた点というのもSpringとの違いとして大きいところでしょう。

百聞は一見にしかずという格言に従い、Scalaへの第一歩、そしてPlay Frameworkの第一歩を進んでみましょう。

### Getting Started!

[こちら](https://www.playframework.com/getting-started)を参考にscalaを入れていきます。

まずはsbtのインストール。sbtはscala用のビルドツールらしいです。javaにとってのmavenみたいなものでしょう。
また、上記にもありますが、今回はmacOS 10.15.4で確認しているので、環境が異なる場合は適宜コマンド等読み替えてください。

```
$ brew install sbt
```

続いてplay frameworkのテンプレートを作成します。

```
$ sbt new playframework/play-scala-seed.g8
```

しばらくすると完了し、`scala-play-seed`というフォルダが現れます。
その中に入って実行してみましょう。

```
$ cd scala-play-seed
$ sbt run
```

![play with scala](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/play%20with%20scala.png)

動きましたね。

### フォルダ構造

ここでPlay Frameworkのフォルダ構造を見てみましょう。

```
app                      → Application sources
 └ assets                → Compiled asset sources
    └ stylesheets        → Typically LESS CSS sources
    └ javascripts        → Typically CoffeeScript sources
 └ controllers           → Application controllers
 └ models                → Application business layer
 └ views                 → Templates
build.sbt                → Application build script
conf                     → Configurations files and other non-compiled resources (on classpath)
 └ application.conf      → Main configuration file
 └ routes                → Routes definition
dist                     → Arbitrary files to be included in your projects distribution
public                   → Public assets
 └ stylesheets           → CSS files
 └ javascripts           → Javascript files
 └ images                → Image files
project                  → sbt configuration files
 └ build.properties      → Marker for sbt project
 └ plugins.sbt           → sbt plugins including the declaration for Play itself
lib                      → Unmanaged libraries dependencies
logs                     → Logs folder
 └ application.log       → Default log file
target                   → Generated stuff
 └ resolution-cache      → Info about dependencies
 └ scala-2.13
    └ api                → Generated API docs
    └ classes            → Compiled class files
    └ routes             → Sources generated from routes
    └ twirl              → Sources generated from templates
 └ universal             → Application packaging
 └ web                   → Compiled web assets
test                     → source folder for unit or functional tests
```

（上記は[公式ページ](https://www.playframework.com/documentation/2.8.x/Anatomy)より引用です）

詳しいことは上記ページを読んでいただければいいのですが、パット見てどのフォルダがどの役割を果たしているのか、非常にわかりやすいですね。

ではここで、現在のコントローラーを見てみましょう。

```scala:HomeController.scala
package controllers

import javax.inject._
import play.api._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject()(val controllerComponents: ControllerComponents) extends BaseController {

  /**
   * Create an Action to render an HTML page.
   *
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index())
  }
}

```

うーん、なんとなくわかるような、わからないような……。おそらくScalaの記法をしっかり学んでからではないと難しいのかもしれません。
でもなんとなくですがRuby on Railsに似てる気はしますよね。

# Kotlin

[Kotlin](https://kotlinlang.org/)はオブジェクト指向言語であり、Androidアプリを記述できる言語としても有名ですね。

個人的にはiOSアプリをSwiftで記載していたことから、Kotlinの存在を知ったときにSwiftとのあまりの類似性に驚きました（実際はSwiftのほうが後発です）。もちろん内部の処理とかは大きく異なりますでしょうが、プログラムシンタックスなどがまぁ似てる似てる。[SwiftとKotlinを比べている記事(A Comparison of Swift and Kotlin Languages)](https://www.raywenderlich.com/6754-a-comparison-of-swift-and-kotlin-languages)もあるので、気になった方は見てみてください。

## Kotlinのサーバーサイド

KotlinというとAndroidのイメージがありますが、サーバーサイドでの採用事例も結構多いです。

例えば[Paypay株式会社](https://logmi.jp/tech/articles/321648)や[株式会社ビズリーチ(のHRMOS)](https://logmi.jp/tech/articles/320886)など、国内でも採用事例が報告されています。

そんなKotlin、サーバーサイドではどんなフレームワークがあるのでしょうか。[公式サイトで言及している](https://kotlinlang.org/docs/reference/server-overview.html)のでちょっと見てみましょう。

- Spring
- Vert.x
- Ktor
- kotlinx.html
- Micronaut
- Javalin

公式にこれだけ記載があるとどれを選べばいいのか迷ってしまいますね。
Google検索の人気度で調べてみましょう。

![Kotlin Frameworks](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Kotlin%20Frameworks.png)

（スクショで申し訳ないですが）こんな感じ。SpringとMicronautはJavaのフレームワークの側面が強かったのでKotlinと入れています。Micronaut単独では最近出たということもあり人気度は高かったのですが、Kotlinとの組み合わせはあまり人気がないようです。

これを見ただけだとKotlin Spring、ついでKtorという人気でしょうか。Javalinも強いですが、Kotlinとの組み合わせではKtorに比べると人気度は低くなってしまいます。

ここまで調べて少し気になったのはKotlin×SpringとKtorでしょうか。Micronautoも気になりますが、ここでは触れないことにします。

SpringはJavaで見てみたので、ここではKtorを触ってみましょう。
また、公式ページに言及がないのですが、ここでHTTP4Kも試してみます。

## Ktor

[Ktor](https://ktor.io/)はKotlin製のWebフレームワークです。公式サイトを見る限りだと、Ktor自身にあまり色々くっついてる感じではないんですね。

### Getting Started

CLIのドキュメントがなかったので、 IntelliJをインストールします。Comunityでいいかな...?

次に[Ktorのプラグイン](https://plugins.jetbrains.com/plugin/10823-ktor-obsolete-)をインストールします。

[Quick Start](https://ktor.io/quickstart/)をみて作ってみます。と言ってもそんなに難しくはないですが。

ちなみにビルドが失敗する場合Gradleの設定からjavaのバージョンを変更します。
![動かない場合](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/%E5%8B%95%E3%81%8B%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88.png)

と思ったら、ビルドが失敗

```
Could not initialize class org.codehaus.groovy.classgen.Verifier
```

もしくはこんなの

```
Could not initialize class org.codehaus.groovy.vmplugin.v7.Java7
```

これはgradleのバージョンが古いことに起因しているので、`gradle/wrapper/gradle-wrapper.properties`を書き換えます。

```:gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
- distributionUrl=https\://services.gradle.org/distributions/gradle-5.6.2-bin.zip
+ distributionUrl=https\://services.gradle.org/distributions/gradle-6.3-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

実行のやり方がわからない！　一応色々触ってみてやったのが、main関数の左側にある実行ボタンをクリックして、`Run 'ApplicationKt'`をクリックすることで実行できました。

![run ktor](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/run%20ktor.png)

というわけで、Hello World!

![Hello world with ktor](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Hello%20world%20with%20ktor.png)

やっぱJavaScriptを普段から書いてると、そのimportは何に効いているのか、ぱっとわからないのが辛いですね。

ではApplication.ktを見てみましょう。

```kotlin:Application.kt
package com.example

import io.ktor.application.*
import io.ktor.response.*
import io.ktor.request.*
import io.ktor.routing.*
import io.ktor.http.*
import io.ktor.html.*
import kotlinx.html.*
import kotlinx.css.*
import io.ktor.client.*
import io.ktor.client.engine.apache.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
  val client = HttpClient(Apache) {
  }

  routing {
    get("/") {
      call.respondText("HELLO WORLD!", contentType = ContentType.Text.Plain)
    }

    get("/html-dsl") {
      call.respondHtml {
        body {
          h1 { +"HTML" }
          ul {
            for (n in 1..10) {
              li { +"$n" }
            }
          }
        }
      }
    }

    get("/styles.css") {
      call.respondCss {
        body {
          backgroundColor = Color.red
        }
        p {
          fontSize = 2.em
        }
        rule("p.myclass") {
          color = Color.blue
        }
      }
    }
  }
}

fun FlowOrMetaDataContent.styleCss(builder: CSSBuilder.() -> Unit) {
  style(type = ContentType.Text.CSS.toString()) {
    +CSSBuilder().apply(builder).toString()
  }
}

fun CommonAttributeGroupFacade.style(builder: CSSBuilder.() -> Unit) {
  this.style = CSSBuilder().apply(builder).toString().trim()
}

suspend inline fun ApplicationCall.respondCss(builder: CSSBuilder.() -> Unit) {
  this.respondText(CSSBuilder().apply(builder).toString(), ContentType.Text.CSS)
}

```

うーん、色々できそうな予感。あんまりチュートリアルがしっかりしてるとは言えないので、結構学習が難しそうなイメージです。

## Http4k

[Http4k](https://www.http4k.org/)もKotlin製のWebフレームワークです。名前からも、説明からも、HTTPサービスのためのツールキット、という感じです。

個人的に気になったのはアノテーションがないということでしょうか。

### Getting Started

具体的なスタート方法がないので、今回はIntelliJでやってみます。

[Getting Started](https://www.http4k.org/quickstart/)を眺めながらやっていきましょう。

まずGradleプロジェクトを作っていきましょう。

![Initial with intelliJ](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Initial%20with%20intelliJ.png)

完全初心者の私には実行するまでもが結構難しかったです。

まずGradleのバージョンが残念なことになるので、`gradle/wrapper/gradle-wrapper.properties`を作成し、ファイルを書き換えます。

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-6.3-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

次にメインとなるプログラムを書きます。

```kotlin:HelloWorld.kt
package quickstart

import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.server.Jetty
import org.http4k.server.asServer

fun main(args: Array<String>) {
    val app = { request: Request -> Response(OK).body("Hello, ${request.query("name")}!") }
    val jettyServer = app.asServer(Jetty(9000)).start()
}
```

公式にあるソースとは少し違いますが、最低でもこれで動きます。

...ちょっとimport文多すぎません？

ちなみに`fun main()`だとIntelliJでは動かなかったので、引数を付けてあげましょう。

![Hello sa2taka from http4k](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Hello%20sa2taka%20from%20http4k.png)

頑張りました。動きました。

# 私なりの結論

私としては最初からJavaは選択肢になく、Scala、もしくはKotlinのどちらかを選択しようと思っていました。

ScalaはPlay Frameworkが実質的なスタンダードだと感じました。もしくはSpring Bootとの二強という感じでしょうか。何れにせよどちらもドキュメントの豊富さも感じられましたしScalaはかなり強力な選択肢の1つになりうるかと思いました。

KotlinはSpring Boot以外のフレームワーク、KtorやHTTP4kはドキュメントの豊富さ、また日本語での情報の少なさというのがまだまだ成長中であると感じました。
採用事例などを調べてもSpring Bootが多く見受けられますね。

おそらくScalaを採用する場合はPlay Framework、KotlinではSpring Bootでしょうか。あとはScalaを触ってみて、Kotlinを触ってみて、どっちが好きかというのを考えるだけでしょうか。

以上、ふわふわなままですがこれにて。
