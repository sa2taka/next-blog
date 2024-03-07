---
layout:      post
title:       Stream Firestore to BigQuery（Firestore BigQuery Export）がパーティションテーブルを作成しない
category:    infra 
author:      sa2taka
tags:        firebase,gcp
public:      true
createdAt:   2024-03-08
updatedAt:   2024-03-08
latex:       false
description:
   Stream Firestore to BigQueryにてBigQueryのテーブルを作成するさい、パーティションの設定を行っているのにパーテションが作成されない謎の調査ログと結論
---

[Stream Firestore to BigQuery（旧Firestore BigQuery Export）](https://extensions.dev/extensions/firebase/firestore-bigquery-export)はFirestoreの更新ログをBigQueryにストリームするFirebaseの拡張です。Firestore自身はその性質から集計や分析が非常に難しいため、上記の拡張を利用することでFirestore上のデータをBigQuery上のテーブルに流すことで集計が可能になります。  

一方でFirestoreの変更のログがすべて吐き出されるため行数が多くなる・カラム型データストアであるBigQueryに対してFirestoreのデータは`data`カラムという1つのカラムに入るといったコスト面での課題があります。  

その課題を解決する1つの策としてBigQueryの[パーティション](https://cloud.google.com/bigquery/docs/partitioned-tables?hl=ja)機能があります。簡単に言えば取り込み日時（取り込み日時以外も可能・数字も可能）によってテーブルを分割し、検索時に日付を絞ることで通常はテーブルの全行を検索するところパーティションで区切った範囲のみ検索対象になり、結果的にコストを抑えることができます。  
Stream Firestore to BigQueryにも作成するテーブルをパーティション分割テーブルにする機能があります。今回はこの機能についての設定の注意点と備忘録です。

# 状況

Stream Firestore to BigQueryには下記の4つのパーティションに関する設定値があります。

- Time partitioning option type
    - 設定の`TABLE_PARTITIONING`
    - テーブルを区切る単位（時間・日・月・年）
- Time partitioning column name
    - 設定の `TIME_PARTITIONING_FIELD`
    - カラムの名前
- Time partitioning table schema
    - 設定の `TIME_PARTITIONING_FIELD_TYPE`
    - カラムの型。`omit`を指定するのが良い
- Firestore document field name
    - 設定の `TIME_PARTITIONING_FIRESTORE_FIELD`
    - Firestoreの特定のフィールドを指定して、それを基準にパーティションを分割する設定

これらの設定を記載しているのですが、パーティションが設定されない状態です。

# 結論

パーティションが適切に設定されるためには**下記の2つのどちらかの状態でなければなりません**。

- `TABLE_PARTITIONING` のみ設定されている
    - ちなみに`TIME_PARTITIONING_FIELD_TYPE`は`omit`を指定すると内部的には「指定なし」という状況になります
- `TABLE_PARTITIONING`・`TIME_PARTITIONING_FIELD`・`TIME_PARTITIONING_FIELD_TYPE`・`TIME_PARTITIONING_FIRESTORE_FIELD` のすべてが設定されている

私の場合は`TABLE_PARTITIONING`に`DAY`・`TIME_PARTITIONING_FIELD_TYPE`に`TIMESTAMP`を設定していたため作成されませんでした。

また上記以外でも作成されない条件があるので記載します。物によってはエラーが出るので`initBigQuerySync`から始まるCloud Functionのログを見てみると良いです。下記のようなケースがあります。

- `TABLE_PARTITIONING` が設定されていない
- 既に同名のテーブルが有る
- `TABLE_PARTITIONING`を時間単位（HOUR）で設定しているが、`TIME_PARTITIONING_FIELD_TYPE`の型がDATE

# 詳細

Firebaseの拡張は[extension.yaml](https://github.com/firebase/extensions/blob/next/firestore-bigquery-export/extension.yaml)を見ると構成や設定値が分かります。今回はインストール時のBigQueryのテーブル作成が問題であると考え、`lifecycleEvents`の`onInstall`である`initBigQuerySync`を探しました。それが下記です。

```typescript:initBigQuerySyncの一部
    /** Init the BigQuery sync */
    await eventTracker.initialize();
```
https://github.com/firebase/extensions/blob/216193c1902cd61b81f13530c04bf69fc2430125/firestore-bigquery-export/functions/src/index.ts#L183-L208

読んでいって、パーティションを作成していそうな関数を見つけます。

```typescript:initializeRawChangeLogTableの一部
      //Add partitioning
      await partitioning.addPartitioningToSchema(schema.fields);

      await partitioning.updateTableMetadata(options);
```

https://github.com/firebase/extensions/blob/216193c1902cd61b81f13530c04bf69fc2430125/firestore-bigquery-export/firestore-bigquery-change-tracker/src/bigquery/index.ts#L400-L403

上記ですが2つ関数があります。BigQueryのパーティションを雰囲気で理解していたので気づかなかったのですが、実はBigQueryの2種類のパーティショニングをサポートしており、それぞれの関数が対応しています。

上は [時間単位列パーティショニング](https://cloud.google.com/bigquery/docs/partitioned-tables?hl=ja#date_timestamp_partitioned_tables)であり、ユーザーが指定したカラムを利用してパーティショニングを行うものです。下は[取り込み時間パーティショニング](https://cloud.google.com/bigquery/docs/partitioned-tables?hl=ja#ingestion_time)であり、BigQueryに取り込まれた時間を利用してパーティショニングを行います。`_PARTITIONTIME`という特別なカラムが作成されます。

[addPartitioningToSchema](https://github.com/firebase/extensions/blob/216193c1902cd61b81f13530c04bf69fc2430125/firestore-bigquery-export/firestore-bigquery-change-tracker/src/bigquery/partitioning.ts#L245-L283)も[updateTableMetadata](https://github.com/firebase/extensions/blob/216193c1902cd61b81f13530c04bf69fc2430125/firestore-bigquery-export/firestore-bigquery-change-tracker/src/bigquery/partitioning.ts#L285-L319)も複数の条件により設定値を確認しています。  
私はこの中の`hasValidCustomPartitionConfig`に引っかかってパーティションが作成されていませんでした。

```typescript:hasValidCustomPartitionConfig
  private hasValidCustomPartitionConfig() {
    /* Return false if partition type option has not been set*/
    if (!this.isPartitioningEnabled()) return false;

    const {
      timePartitioningField,
      timePartitioningFieldType,
      timePartitioningFirestoreField,
    } = this.config;

    const hasNoCustomOptions =
      !timePartitioningField &&
      !timePartitioningFieldType &&
      !timePartitioningFirestoreField;
    /* No custom config has been set, use partition value option only */
    if (hasNoCustomOptions) return true;

    /* check if all valid combinations have been provided*/
    const hasOnlyTimestamp =
      timePartitioningField === "timestamp" &&
      !timePartitioningFieldType &&
      !timePartitioningFirestoreField;
    return (
      hasOnlyTimestamp ||
      (!!timePartitioningField &&
        !!timePartitioningFieldType &&
        !!timePartitioningFirestoreField)
    );
  }
```

https://github.com/firebase/extensions/blob/216193c1902cd61b81f13530c04bf69fc2430125/firestore-bigquery-export/firestore-bigquery-change-tracker/src/bigquery/partitioning.ts#L78-L106

若干条件文が分かりづらいですが、`hasNoCustomOptions`は`TABLE_PARTITIONING`のみが設定されているケース。それ以外では3つのプロパティがすべて設定されているケースです。
が、`hasOnlyTimestamp`という文言を見ると`TIME_PARTITIONING_FIELD_TYPE`が`TIMESTAMP`でも問題ないように見えますが、`timePartitioningField`が`timestamp`の場合という感じです（`timestamp`はこの拡張のデフォルトで作成するカラム）。
色々設定を変更して試していたところ`TIME_PARTITIONING_FIELD_TYPE`だけ設定した状態を引き継いでいたせいでこの様な状態になっていました。

:::warning
とある理由で0.1.43で確認していたのですが、0.1.43では下記のように常に`No valid table reference is available. Skipping partitioning`というログが出て困惑しました。

```typescript:0.14.3のhasValidTableReference
  hasValidTableReference() {
    logs.invalidTableReference();
    return !!this.table;
  }
```
https://github.com/firebase/extensions/blob/861c2e60e8595577386c9683baf2ee1c77bf6751/firestore-bigquery-export/firestore-bigquery-change-tracker/src/bigquery/partitioning.ts#L130-L133

0.1.45では治っているので大丈夫です。

```typescript:0.14.5のhasValidTableReference
  hasValidTableReference() {
    if (!this.table) {
      logs.invalidTableReference();
    }
    return !!this.table;
  }
```
https://github.com/firebase/extensions/blob/9a94f260b38ec5ea0ec6260248847f95a10622ff/firestore-bigquery-export/firestore-bigquery-change-tracker/src/bigquery/partitioning.ts#L130-L135
:::
