---
layout:      til
title:       PostgreSQLのJSON配列に要素を追加する方法
category:    PostgreSQL
createdAt:   2025-02-17
updatedAt:   2025-02-17
---

PostgreSQLはカラムにJSONが使えます（まぁ、最近のSQLはだいたいサポートしているが）。JSONの特定の要素が配列で、その配列にデータを追加する際、なんか変なクエリ書くだけでJSONのそれ以外の部分が消えてしまうおそれがあります。

例えば下記のようなJSONが `json` カラムにあるとします。

```json
{
  "str": "data",
  "obj": {
    "key": "value"
  },
  "array": [{ "elm": "1" }, { "elm": "2" }]
}
```

この時、 `array` に `{ "elm": "3" }` を末尾に追加するクエリは下記のようになります。

```sql
UPDATE table_name
SET json = JSON_SET(
  json,
  '{array}',
  COALESCE(json->'array', '[]'::JSON) || '[{"elm": "3"}]'::JSON
)
WHERE id = 1;
```

`JSON_SET` の代わりに `||` を利用することでも似たような感じの動作になります。

```sql
UPDATE table_name
SET json = json 
  || json_build_object('array', COALESCE(json->'array', '[]'::JSON) || '[{"elm": "3"}]'::JSON)
WHERE id = 1;
```

`||` は配列の結合演算子で、 `COALESCE(json->'array', '[]'::JSONB)` は `json` の `array` が存在しない場合に空の配列を返すための処理です。

JSONBの場合はJSONB用の演算子があるので、JSON_の部分をJSONB_にすればだいたい動きます。
