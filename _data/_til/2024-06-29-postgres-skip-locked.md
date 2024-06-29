---
layout:      til
title:       PostgreSQLのSKIP LOCKED
category:    sql
createdAt:   2024-06-29
updatedAt:   2024-06-29
---

PostgreSQLを利用して、キューのようなものを作成したくなったところ、SKIP LOCKEDというものを知りました。
名前の通り、ロックされている行ををスキップしてくれるものです。

例えば下記のようなテーブルを作成してみます。

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tasks (id) VALUES (1), (2), (3), (4), (5);
```

現状こんな感じ。

```sh
$ select * from tasks;
 id | status  |          created_at
----+---------+-------------------------------
  1 | pending | 2024-06-29 12:34:50.000000+00
  2 | pending | 2024-06-29 12:34:51.000000+00
  3 | pending | 2024-06-29 12:34:52.000000+00
  4 | pending | 2024-06-29 12:34:53.000000+00
  5 | pending | 2024-06-29 12:34:54.000000+00
```

ここで、下記のようなトランザクションを実行します。まだコミットしていないので対象の行はロックされたままです。

```sh
$ BEGIN;
$ SELECT id FROM tasks ORDER BY created_at LIMIT 1 FOR UPDATE;
 id
----
  1
```

この間にトランザクション外から下記のコマンドを実行してみます。

```sh
$ SELECT id FROM tasks FOR UPDATE SKIP LOCKED;
 id
----
  2
  3
  4
  5
```

この様に、ロックされたid 1の行をスキップしました。

PostgreSQLのリファレンスには[SELECT - ロック処理句](https://www.postgresql.jp/document/9.6/html/sql-select.html#sql-for-update-share)に記載があります。
こちらの機能はSQL標準ではないようですが、[MySQLにも存在しています](https://dev.mysql.com/doc/refman/8.0/ja/innodb-locking-reads.html)。おそらく8.0から。
