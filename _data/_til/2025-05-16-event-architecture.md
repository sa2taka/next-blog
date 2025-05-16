---
layout:      til
title:       イベントドリブンなアーキテクチャのパターン
category:    architecture
createdAt:   2025-05-16
updatedAt:   2025-05-16
---

最近 [microservices architectureのパターン](https://microservices.io/tags/pattern)を知った。マイクロサービスに関するパターンが網羅されていてこういう名前がついているんだ、ということが知れた。

RDBMSとCloud Tasksを組み合わせて使うことが多いので

- [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html)
- [Idempotent consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html)

あたりは初めて知ったので、活用できそうだなと思ったのでメモ。まぁ考えれば結局この結論になりそうだが...。

# Transactional outbox

一般的にRDBMSに何らかのデータを作成し、メッセージブローカー（例えばCloud TasksやPub/Sub、SQSとか）にメッセージを送信するのがマイクロサービスの基本（マイクロサービス自体は詳しくないが）。めっちゃ簡潔に書くなら下記だろう。

```typescript
await db.transaction(async (tx) => {
  const order = await tx.createOrder({...});
});
await sendMessage(order);
```

sendMessageはトランザクションがコミットされた後、つまりDBに更新がかかった後にメッセージを送信する。しかし、sendMessageが失敗した場合、トランザクションはロールバックされない。つまり、DBにはデータが残っているのにメッセージは送信されていない状態になる。これを解消するためにトランザクションの中でメッセージを送信するケースを考える。

```typescript
await db.transaction(async (tx) => {
  const order = await tx.createOrder({...});
  await sendMessage(order);
});
```

sendMessageはトランザクションの中で実行されるため、sendMessage終了後、今回の例ではトランザクションのコミットに失敗した場合、メッセージが送信されたのにも関わらずDBにはデータが残っていない状態になる。より複雑なトランザクションであればメッセージ送信後に処理を行う必要があるかも知れない。そうなるとメッセージを送信したのにROLLBACKされている可能性はある。

これを解消するのがTransactional outboxパターンである。トランザクションの中でメッセージを送信するのではなく、トランザクションの中でメッセージをDBに保存する。トランザクションがコミットされた後、別のプロセスがメッセージを送信する。

```typescript
await db.transaction(async (tx) => {
  const order = await tx.createOrder({...});
  await tx.saveMessage(order);
});
```

別サービスでは下記のような処理が何らかのスケジューラー等で実行される。

```typescript
const messages = await db.getMessages();
for (const message of messages) {
  await sendMessage(message);
  await db.deleteMessage(message);
}
```

このようにすることで、DBのデータとメッセージングをアトミックにできる。


# Idempotent consumer

Idempotent consumerは、メッセージを受信した際に同じメッセージを何度も受信しても問題ないようにするパターンである。特にCloud TasksやPub/Sub、SQSのサービスは"least once"の保証をしている（Pub/SubやSQSはexactly onceもあるらしいが）。逆に言えば同じリクエストがに2回発行されることもあるわけで、これを考慮する必要がある。

解決方法はシンプルで、処理開始時にDBに何らかのIDを保存しておく。処理が終わった後、DBからIDを削除する。次回同じメッセージが来た場合、DBにIDが存在するか確認し、存在した場合は処理をスキップする。

```typescript
const id = requestBody.id;

const rowsAffected = await db.execQuery(
  'INSERT INTO processed_messages (id) VALUES (?) ON CONFLICT DO NOTHING',
  [id],
);

if(rowsAffected === 0) {
  // メッセージはすでに処理済みなのでスキップ
  return;
}

// 処理を行う

await db.execQuery('DELETE FROM processed_messages WHERE id = ?', [id]);
```

ここではDBを用いているが、Redisの`NX`オプションを使うなりすることでも解決可能だ。

:::warning
ミスると[こうなる](https://www.fujitsu.com/jp/group/fjj/about/resources/news/topics/2023/0509.html#:~:text=%E6%9C%AC%E4%BA%8B%E8%B1%A1%E3%81%AE%E5%8E%9F%E5%9B%A0%E3%81%AF%E3%80%812%E3%81%8B%E6%89%80%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%93%E3%83%8B%E3%81%A7%E3%80%812%E5%90%8D%E3%81%AE%E4%BD%8F%E6%B0%91%E3%81%AE%E6%96%B9%E3%81%8C%E5%90%8C%E4%B8%80%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0%EF%BC%88%E6%99%82%E9%96%93%E9%96%93%E9%9A%941%E7%A7%92%E4%BB%A5%E5%86%85%EF%BC%89%E3%81%A7%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%81%AE%E4%BA%A4%E4%BB%98%E7%94%B3%E8%AB%8B%E3%82%92%E8%A1%8C%E3%81%A3%E3%81%9F%E9%9A%9B%E3%81%AB%E3%80%81%E5%BE%8C%E7%B6%9A%E3%81%AE%E5%87%A6%E7%90%86%E3%81%8C%E5%85%88%E8%A1%8C%E3%81%99%E3%82%8B%E5%87%A6%E7%90%86%E3%82%92%E4%B8%8A%E6%9B%B8%E3%81%8D%E3%81%97%E3%81%A6%E3%81%97%E3%81%BE%E3%81%86%E3%81%93%E3%81%A8%E3%81%AB%E3%82%88%E3%82%8B%E3%82%82%E3%81%AE%E3%81%A7%E3%81%99)。

> 本事象の原因は、2か所のコンビニで、2名の住民の方が同一タイミング（時間間隔1秒以内）で証明書の交付申請を行った際に、後続の処理が先行する処理を上書きしてしまうことによるものです。
:::

色々な記事を漁ると、最後にDELETEを入れない場合が多いが、Cloud Tasksのようにメッセージを再送信する場合は消すか、もしくはCloud Tasksから渡されるリトライカウントなどもキーに入れて保存するなどが必要になるかも知れない。
