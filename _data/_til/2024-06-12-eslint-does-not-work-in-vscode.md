---
layout:      til
title:       ESLintがCLIだと動くのにVSCodeだと動かない
category:    vscode 
createdAt:   2024-06-12
updatedAt:   2024-06-12
---

下記の条件を満たしていると、VSCodeのバージョンが1.90.0（2024-06-12時点での最新）以下で動作しない。

- typescript-eslintを利用している
- monorepoを利用している
- ESMである・`eslint.config.mjs`である
- `languageOptions.parserOptions` の `project` および `tsconfigRootDir` を設定している
- **`import.meta.dirname` を利用している** ← これが原因

原因としては、VSCode1.90.0の内部で利用されているElectron 29のNode.jsのバージョンが20.9.0であるため、`import.meta.dirname`が利用できない。
`import.meta.url`は利用できるため、下記のような回避策で解決できる。

```typescript:eslint.config.json
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = import.meta.dirname ?? path.dirname(filename);

export default tseslint.config(
  ...,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json", "./packages/*/tsconfig.json"],
        tsconfigRootDir: dirname,
      },
    },
  },
  ...,
)
```

[Node.js 20.11.0で追加されている](https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V20.md#2024-01-09-version-20110-iron-lts-ulisesgascon) ので、Electron v30（Node.js 20.11.1）では`import.meta.dirname`が利用可能になるはず。
