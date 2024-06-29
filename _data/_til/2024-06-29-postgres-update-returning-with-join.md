---
layout:      til
title:       SQLのUPDATE RETURNINGで更新対象外のテーブルをJoinする
category:    sql
createdAt:   2024-06-29
updatedAt:   2024-06-29
---

更新処理を実行した後、対象以外のテーブルをジョインしてRETURNINGして欲しくなった。
まぁ、これに関しては、実装的に1つのクエリでやりたいことが2つ出てしまうのであまり良くないと思ったので、結局は更新処理と取得処理を分離した。通信に関してあまり詳しくはないが、仮にトランザクション中であれば接続貼りっぱなしだと思うので通信のRTTも気にならんだろうし。
ただ、JOINしてWHEREしたいケースにも利用できる（というか、どちらかというとそちらがメイン）。

FROM句を利用する。UPDATEにFROM句が使えるんだな。下記は[PostgreSQLのリファレンス](https://www.postgresql.jp/docs/9.0/sql-update.html)より引用し、RETURNINGを追加している。

```
UPDATE employees SET sales_count = sales_count + 1 FROM accounts
  WHERE accounts.name = 'Acme Corporation'
  AND employees.id = accounts.sales_person
RETURNING
  employees *, accounts.*;
```
