---
layout:      til
title:       npm scriptsで引数をいい感じに分割して複数コマンドに分配したい
category:    npm
createdAt:   2024-06-14
updatedAt:   2024-06-14
---

タイトルからだとかなり読みづらいが、下記のようなことをしたい。こういった欲求は度々起こるが、その度調べては難しそうだったので諦めていた。簡単に言えばnpm scriptsの内部で引数を分離したいのである。

```json:lint・prettierを一発でやるコマンド
{
  "scripts": {
    "lint:fix": "eslint --fix",
    "prettier:write": "prettier --write",
    "format": "???"
  },
}
```

上記のスクリプトがある前提で、下記を期待する。

```bash
$ npm format __tests__/index.test.ts
> npm lint:fix __tests__/index.test.ts && npm prettier:write __tests__/index.test.ts
```

例えばシンプルに下記のようにする。


```json:lint・prettierを一発でやるコマンド
{
  "scripts": {
    "lint:fix": "eslint --fix",
    "prettier:write": "prettier --write",
    "format": "npm lint:fix && npm prettier:write"
  },
}
```

そうすると最後に引数がくっつくだけである。

```bash
$ npm format __tests__/index.test.ts
> npm lint:fix && npm prettier:write __tests__/index.test.ts
```

[npmだけではそういうことはできなさそう](https://docs.npmjs.com/cli/v10/using-npm/scripts) だが、ここで[npm-run-all](https://www.npmjs.com/package/npm-run-all)の存在を思い出した。もう6年前から更新されてない。
結論としてはnpm-run-allで今回の欲求は満たせた。[Argument placeholders](https://www.npmjs.com/package/npm-run-all)という機能を利用すれば良い。


```json:lint・prettierを一発でやるコマンド
{
  "scripts": {
    "lint:fix": "eslint --fix",
    "prettier:write": "prettier --write",
    "format": "run-s 'lint:fix {1}' 'npm prettier:write {1}' --"
  },
}
```

```bash
$ npm format __tests__/index.test.ts
> npm lint:fix __tests__/index.test.ts && npm prettier:write __tests__/index.test.ts
```

最後の `--` はscripts側にないと想定通りに動作にはならない。
