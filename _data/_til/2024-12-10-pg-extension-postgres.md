---
layout:      til
title:       Docker上でPostgreSQLの拡張機能（pg_cron）を有効化する
category:    PostgreSQL
createdAt:   2024-12-10
updatedAt:   2024-12-10
---

先日[pg_cron](https://blog.sa2taka.com/til/2024-12-09-pg-cron/)を知りました。で、こいつを開発環境のPostgreSQLに入れようと考えました。正直こいつを開発環境にいれるのは不要だと思いますが、他に開発環境でも使いたい拡張が現れたときに対応できるよう、試しに開発環境で有効化する方法を調べました。まぁあんまり開発環境のDocker上で拡張を有効化している人いませんでしたが。

pg_cronを追加すると仮定すると、下記のようなDockerfileで対応可能です。ちなみに15を使っている理由は開発開始時にAlloyDBが16をサポートしていなかったからです。今は16もサポートしています。

```Dockerfile
FROM postgres:15

RUN apt-get update && apt-get -y install postgresql-15-cron

COPY ./entrypoint-pg-cron.sql /docker-entrypoint-initdb.d

CMD ["postgres", "-c", "shared_preload_libraries=pg_cron", "-c", "cron.database_name=development"]
```

同一ディレクトリに下記のファイルを追加します。

```sql:entrypoint-pg-cron.sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

`docker-comose`を利用する場合も、通常のイメージを置き換える形で問題ないです。

```yaml:compose.yml
services:
  db:
  # image: postgres:15
    build:
      context: .
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: development
    ports:
      - 5432:5432
    volumes:
      - db_volume:/var/lib/postgresql/data
```

Dockerfileについての解説です。

`postgresql-15-cron` のインストールは `pg_cron` の[インストール方法](https://github.com/citusdata/pg_cron?tab=readme-ov-file#installing-pg_cron)に従っているだけです。ちなみにPostgreSQLのイメージは [`debian:bookworm-slim` がベースになっているので](https://github.com/docker-library/postgres/blob/50b4cdb50e3599013f2fce9cd8860600f53c696c/15/bookworm/Dockerfile#L7)、Debianベースのインストールです。

[`/docker-entrypoint-initdb.d`](https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts) はPostgreSQLのDockerにてデータベースを立ち上げてから実行されるSQLまたはシェルスクリプトを配置するディレクトリです。ここに `create extension` をするSQLを配置しています。
**注意点として**、こちらのスクリプトはすでにデータベースが構築されていると動作しません。永続化しているvolumeなどですでにデータベースが構築されている場合は `docker compose down -v` とか `docker volume rm` とかで該当のボリュームを削除してください。

最後に`CMD`を拡張しています。本来の`CMD`は`postgres`1つだけなので、オプションをくっつけたい場合はただ増やせばいいだけです。
confファイルを更新する方法も合ったんですが、ファイルを用意したりする必要があるので見送りました。オプションの内容は[セッティング](https://github.com/citusdata/pg_cron?tab=readme-ov-file#setting-up-pg_cron)に記載されています。timezoneを指定する場合はここに追加します。

調査の際に参考にしたのは下記の記事です。

- https://qiita.com/naozo-se/items/9b7b56e3dc9653a1e27f
