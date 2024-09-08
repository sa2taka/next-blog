---
layout:      til
title:       Dockerのマルチステージビルド
category:    docker
createdAt:   2024-09-06
updatedAt:   2024-09-06
---

Dockerについて半日ぐらい調べたときの成果1。マルチステージビルドについて。

[公式ドキュメント](https://docs.docker.com/build/building/multi-stage/)以上や、その他既にたくさんある記事以上の情報はないが、少なくとも令和のDockerfileでは必須な知識だと思う。

:::information
ちなみにMulti Stage Buildは[Docker 17.05](https://docs.docker.com/engine/release-notes/17.05/)からで、平成29（2017年）年5月にリリースされている。
:::

下記のように、FROMが2個以上出てくるのが特徴だ。例えばWebpackによりバンドルしたファイルをnodeで実行するときなんかにとても効力を発揮する。

```dockerfile
FROM node:22 AS build

WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:22 AS runtime
WORKDIR /app
COPY --from=build /app/dist /app/dist
CMD ["node", "dist/index.js"]
```

ステージというのは簡単に言えばFROMで定義したイメージのことで、上記ではビルドと実行の2つのステージがある。Dockerの最終的な成果物は最後のステージのイメージになる。この場合は`runtime`ステージだ。
`COPY --from`により異なるステージの中で生成されたファイルをコピーできる。上記では最終的に実行に必要なバンドル後の`app/dist`ディレクトリを`runtime`ステージにコピーしている。

これの最大の利点は**最終的な成果物のサイズが小さくなる**ことだ。1つのステージしかなければ（明示的に削除しない限り）`node_modules`や`src`など不要なファイルがふくまる。とくに`node_modules`なんかはデカくなりがちであるため、これを削除することでイメージのサイズを小さくできる。
