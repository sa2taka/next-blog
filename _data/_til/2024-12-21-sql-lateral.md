---
layout:      til
title:       LATERALを使ったクエリ
category:    SQL
createdAt:   2024-12-21
updatedAt:   2024-12-21
---

SQLのLATERALというのを知りました。個人的な理解としては効率的なCROSS JOIN、N+1クエリのSQL版といった感じです（N+1に関してはJOINしてればだいたいそうだが）。LATERALはサブクエリの中で外側のクエリの値を参照できるという特徴があります。

具体例として下記のようなテーブルを考えてみます。アンケートと、その回答を格納するテーブルです。以降PostgreSQLを前提としています。

```sql
CREATE TABLE surveys (
  survey_id bigint primary key,
  first_served_campaign bool
);

CREATE TABLE answers (
  answer_id bigint primary key,
  survey_id bigint,
  user_id bigint,
  answered_at timestamptz
);
```

ここで、アンケートに回答したユーザーの中で、先着3名までにプレゼントをする企画があったとします。 `first_served_campaign` カラムがtrueの場合、そのアンケートが対象となります。このとき、先着3名のユーザーを取得するクエリを考えます。

パッと思いつくのがウィンドウ関数を用いる関数です。

```sql
WITH filtered_surveys AS (
  SELECT survey_id
  FROM surveys
  WHERE first_served_campaign = true
),
ranked_answers AS (
  SELECT 
    fs.survey_id,
    a.user_id,
    a.answered_at,
    ROW_NUMBER() OVER (PARTITION BY fs.survey_id ORDER BY a.answered_at) AS rank
  FROM filtered_surveys fs
  JOIN answers a ON fs.survey_id = a.survey_id
)
SELECT 
  survey_id, user_id
FROM  ranked_answers
WHERE rank <= 3
ORDER BY survey_id;
```

ただ、このクエリ、ちょっと遅い。`ranked_answers` で全ての回答を取得してから、その中から先着3名を取得しているためです。ここでLATERALを使うと、サブクエリの中で外側のクエリの値を参照できるため、効率的に取得できます。

```sql
SELECT 
  s.survey_id,
  a.user_id
FROM 
  surveys s,
  LATERAL (
  SELECT user_id
  FROM answers
  WHERE answers.survey_id = s.survey_id
  ORDER BY answered_at
  LIMIT 3
) a
WHERE s.first_served_campaign = true
ORDER BY  s.survey_id;
```

`first_served_campaign` がtrueなアンケートが5,000件、回答がそれぞれアンケート毎に10,000件つまり合わせて回答が合わせて50,000,000件ある場合、前者のクエリは50,000,000件の回答を取得してから先着3名を取得しますが、後者のクエリはアンケート毎に3名の回答を取得するため、つまり15,000件の回答を取得するだけで済みます。実際、実行計画を見ると、前者のクエリは `Gather Merge` が50,000,000行に対して、後者のクエリは `Nested Loop` が15,000行に対して行わるような計画になっています。結果コストが圧倒的に変わります。
