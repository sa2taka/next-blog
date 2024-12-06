---
layout:      til
title:       Playwrightで動かすElectron上でipc通信を発火する
category:    Electron
createdAt:   2024-11-29
updatedAt:   2024-11-29
---

Playwrightでは[Electronの自動化](https://playwright.dev/docs/api/class-electron)を（実験的ながら）サポートしています。Playwright、Electron単体でもとっつきづらいのに、その2つが組み合わされば特級呪物になりそうな気がします。Smokeテスト程度であればよさそうかもしれません。

Electronは大雑把に言うとmainプロセスとrendererプロセスがあります。rendererプロセスは通常のブラウザです。例えばファイルの読み取り・更新をしたいときなどはnode.jsであるmainプロセスにIPC通信することで実現します。逆も同様で、mainプロセスで何らかのイベント、特定のファイルが更新された場合などにrendererプロセスにIPC通信することでファイルの変更をブラウザに反映させることができます。

テストを実施するときに、例えばどうしてもmain → rendererプロセスの通信の発火条件を満たせないケースがあったとします。ここでは特定のファイルが更新された場合、という条件とします（それぐらいなら頑張って発火できると思いますが）。このときにrendererプロセスに対してIPC通信でデータを送信する方法です。

下記が基本形です。

```typescript
const { _electron: electron } = require('playwright');

(async () => {
  const electronApp = await electron.launch({ args: ['main.js'] });

  const electronPage = await electronApp.firstWindow();
})();
```

ここで重要なのは`electronApp`がmainプロセス、`electronPage`がrendererプロセスに紐づいていることです。今回はmain → rendererの通信ですので、`electronPage`でデータをsendします。
具体的には`evaluate`メソッドを利用します。

```typescript
await electronApp.evaluate(async (app) => {
  // NOTE: ウィンドウIDは起動時からインクリメントされるため、最初に開いたウィンドウである1を指定している
  const focusedWindow = app.BrowserWindow.fromId(1);
  focusedWindow?.webContents.send("changeConfigFile", {
    config: {
      hoge: "fuga",
    }
  });
});
```

上記のようにすることでデータを送信できます。が、残念ながらwindowのIDを取得できないため、そこは固定値にするしか現状は無いと思われます。幸いなことにElectronのwindowのIDは1からインクリメンタルされる数字なので特定は容易いです。
