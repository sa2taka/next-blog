---
layout:      til
title:       Dockerでモノレポのpackage.jsonをいい感じにコピーする（ディレクトリ構造を維持しつつコピーする）
category:    docker
createdAt:   2024-09-06
updatedAt:   2024-09-06
---

Dockerについて半日ぐらい調べたときの成果3。`COPY --parents`について。

:::information
本題の前に、今回の話と直接関係ないが、別の記事にするほどでもないかなと思い書き残しておく。**Dockerにはレイヤという概念があります**。これを知るのがDocker初心者から抜け出す第一歩だと思う（逆にこれを知らなかった先週の私は初心者）。
レイヤに関しては[公式ドキュメント](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/)に記載されているが、[日本語の翻訳プロジェクトの記事](https://docs.docker.jp/build/guide/layers.html)の方が理解はし易いと思う。ただしこちらはDocker v23の情報だ。

今回の話であるCOPYなんかは特に重要で、例えば `COPY . .` のあと `RUN npm install`するより `COPY ./package.json ./package.json` した後に `RUN npm install` する方がキャッシュが効いて高速になる。
:::

モノレポ環境でDockerのビルドをしたい時に、`yarn install` をしたい場合、2つほど問題が発生する。

- 他パッケージに依存しているときはモノレポのルートでCOPYをする必要がある
- `yarn install --immutable`をする場合は、すべてのモノレポの`package.json`が必要

上記を解決するためには、モノレポのルートをビルドコンテキストとして指定する必要がある。そこで各パッケージの`package.json`をコピーしたいが、`COPY ./packages/*/package.json .` のようなコピーの方法は**使えない**。というのもこれだと`./packages/backend/package.json`を`./package.json`にコピーした後`./packages/frontend/package.json`を`./package.json`にコピーする、という感じの動作になる。つまり、**最後にコピーした`package.json`が残る**。これを解決するのには`COPY ./packages/backend/package.json ./packages/backend/package.json`のように、コピー元とコピー先を指定する必要がある。これだとパッケージが増える度に指定する必要がある。

そこで**[COPY --parents](https://docs.docker.com/reference/dockerfile/#copy---parents)**を利用する。これは**コピー元の親ディレクトリを保持したままコピーしてくれる**、上記の課題を解決してくれるすぐものだ。

```dockerfile
COPY --parents ./packages/*/package.json ./
```

とやると、`./packages/backend/package.json`を`./packages/backend/package.json`にコピーし、`./packages/frontend/package.json`を`./packages/frontend/package.json`にコピーする、という動作になる。

ドキュメントに記載通りだが、上記はstableな機能ではないため、`# syntax=docker/dockerfile:1.7-labs`を**先頭に扶養する必要がある**。
