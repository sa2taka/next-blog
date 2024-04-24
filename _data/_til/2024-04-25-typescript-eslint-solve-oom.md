---
layout:      til
title:       TypeScript ESLintがモノレポ環境でOOMになるのを解決
category:    typescript,eslint
createdAt:   2024-04-25
updatedAt:   2024-04-25
---

[TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint)はTypeScriptの型情報を利用して、よくあるミスを洗い出してくれるいい子ですが、そのかわり1回TypeScriptのパーサーを挟むので重い・遅い・メモリを食うという状況になります。

重すぎるので今までCI以外では切っていたんですが、Flat Config化するにあたり、せっかくなら普段のVSCode上でエラーも出したいしということでTypeScript ESLintを全体有効化したところ、設定が誤っていて今までモノレポ環境のLintでTypeScript関連のルールが動いていなかったことが判明。エラーが2つぐらいでるようになったのは良いのですが、何やったってCIがメモリエラーで死ぬ。何なら32GBある私のPCもメモリエラーが吐かれる。
下記のようなエラーですね。

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

調べたところ、ちょうど今日[解決策](https://github.com/typescript-eslint/typescript-eslint/issues/1192#issuecomment-2071711326)がissueに投稿されていました。
`EXPERIMENTAL_useProjectService`というプロパティを設定すればよいようです。

flat configであれば下記のように`parserOptions`を設定しましょう。

```javascript:eslint.config.js
export default [
  {
    languageOptions: {
      parserOptions: {
        ...,
        EXPERIMENTAL_useProjectService: true,
      },
    },
  }
]
```

[EXPERIMENTAL_useProjectService](https://typescript-eslint.io/packages/parser/#experimental_useprojectservice)は名前の通りまだexpreimentalな機能です。
TypeScript ESLintが重い理由は`ts.CreateProgram`を[利用している](https://github.com/typescript-eslint/typescript-eslint/blob/4bed24d8d37ab066b6f3b988fd1ca7accec931c0/packages/typescript-estree/src/create-program/createIsolatedProgram.ts#L64-L74)からです（多分）。
で、上記を有効にすると、[こんな感じ](https://github.com/typescript-eslint/typescript-eslint/blob/4bed24d8d37ab066b6f3b988fd1ca7accec931c0/packages/typescript-estree/src/useProgramFromProjectService.ts#L69C2-L72C19)でASTを取得します。

```typescript:useProgramFromProjectService.ts
const program = service
    .getDefaultProjectForFile(scriptInfo!.fileName, true)!
    .getLanguageService(/*ensureSynchronized*/ true)
    .getProgram();
```

これがなぜ早くなるのか、正直全くわかりませんが実際にOOMが解決されるのでなにか意味があるのでしょう。
Copilot3.5では無理でしたが、Claudeで聞くといい感じに答えてくれます。全然情報が無いですね...。

私のJS Test Outlineもts.Program利用しているので、ProjectServiceの利用を検討してみようかしら。
