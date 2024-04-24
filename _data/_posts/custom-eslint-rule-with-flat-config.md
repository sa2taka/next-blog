---
layout:      post
title:       Flat Config時代の自作ESLint
author:      sa2taka
category:    typescript
tags:        javascript,typescript,eslint
public:      true
createdAt:   2024-04-25
updatedAt:   2024-04-25
latex:       false
description:
    ESLintがFlat Configを推奨しているので、Flat Config時代の時代の自作ESLintルールを調べました。
---

ESLintは先日[v9.0.0をリリースしました](https://eslint.org/blog/2024/04/eslint-v9.0.0-released/)。

何と言っても最大の変更はFlat Configのデフォルト化でしょう。v8の途中から追加されたFlat Configは今までの設定から大きく変化が加わっています。
私は[ESLintの自作ルールを作る記事](https://blog.sa2taka.com/post/custom-eslint-rule-with-typescript/)を記載していますが、当然この自作ルールに関しても影響があります。
設定自体は大きく修正する必要があるのと、正直未だにFlat Configに対応していないライブラリも多いですが（対応してなくても大抵は問題なく使える）、こと自作ルールに関してはFlat Configでかなり使いやすくなりました。

今回は自作ルールをFlat Config対応する方法を含め記載していきます。そちらだけみたい方は[#自作ルールとFlat Config](#自作ルールとFlat%20Config)を参照してください。

# Flat Config

そもそも既存の設定とFlat Configの違いはなにか。正直この記事にたどり着くほとんどの方は知っていると思いますので、個人的な感想としてFlat Configの変更点を記載します。
あくまでFlat Configへ意向した身の感想ではありますが、最大の特徴はプラグインの扱い方とルールの平坦化、つまりルールがFlatになったことだと思います。

# プラグインの扱い

ESLintの関連ライブラリには大きな特徴があります。新しいルールを作成する場合は`eslint-plugin-hogehoge`または`@hogehotge/eslint-plugin`、ルールのプリセットは`eslint-config-fugafuga`という命名規則でnpm等に公開されています。これは、これらの命名規則に従っていると、`eslint-plugin`や`/eslint-plugin`、`eslint-config`を取り除いて設定値を代入できるからです。個人的にはライブラリ間で整合性ができるので、素晴らしいアイデアだと思っています。
例えば、`eslint-plugin-unicorn` であれば、下記のように`plugin`の部分に`unicorn`と記載するだけで良いのです。

```json:.eslint.json
{
  "plugins": [
    "unicorn"
  ],
  "rules": {
    "unicorn/better-regex": "error",
  }
}
```

一方でFlat Configでは上記のような記載はしません。下記のように、JavaScriptのライブラリとしてインポートし、JavaScriptのオブジェクトに展開するだけです。

```javascript:eslint.config.js
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import * as eslintrc from '@eslint/eslintrc';

export default [
	{
		plugins: {
			unicorn: eslintPluginUnicorn,
		},
		rules: {
			'unicorn/better-regex': 'error',
		},
	},
];
```

これはこれで、ブラックボックス的な薄れて、良い形だと思います。

# ルールのFlat化

このFlat Configの最大の目的は[ESLint's new config system, Part 1: Background](https://eslint.org/blog/2022/08/new-config-system-part-1/)に記載されている通りです。カスケードされるルールやoverrides・extendsのような機能の複雑性が高くなることから簡素化を行う必要性が出たことから、簡素化されたルールとしてFlat Configという解決策が現れました。

特徴としては旧来の`extends`や`overrides`の機能が完全に消えました。設定は配列として現れ、後ろの要素の設定が優先されるというもの。

例えば、従来は`overrides`を用いて記載するような下記の設定。

```jsonc:.eslintrc.json
{
  // その他のルール
  "overrides": [
    // テストに関するルール
    {
      "files": ["__tests__/**"],
      "plugins": ["jest"],
      "extends": ["plugin:jest/recommended"],
      "rules": { "jest/prefer-expect-assertions": "off" }
    }
  ],
}
```

これは下記になります。

```javascript:.eslint.config.js
import eslintPluginJest from "eslint-plugin-jest";

export default [
  ...,
  {
    files: ["**/__tests__/**"],
    ...eslintPluginJest.configs["flat/recommended"],
    "rules": { "jest/prefer-expect-assertions": "off" }
  },
]
```

他のルールと同じ階層で、ルールのオブジェクトとして記載してあげれば良くなります。

個人的には。

```
設定 -> プラグインごとのルール ... -> 自分のルール -> 特定のファイルのみのルール ... -> 対象外
```

という感じで分割しました。特にプラグイン単位で分割することで、今までになかった見やすさみたいなのも得られることが出来ているので、その点も良かったなと思っています。

# 自作ルールとFlat Config

上記を見て分かったと思いますが、プラグインはインポートして展開します。自作のルールはただのJavaScriptですので、インポート可能です。つまり、インポートして展開してあげればいいだけなのです。
[旧方法](https://blog.sa2taka.com/post/custom-eslint-rule-with-typescript/#%E8%A8%AD%E5%AE%9A%E4%BD%9C%E6%A5%AD)では[eslint-plugin-local-rules](https://github.com/cletusw/eslint-plugin-local-rules)のような他のライブラリを導入していましたが、それが不要になります。

## 旧方法からの移行

旧方法では下記のようなファイルを作成していました。もしかしたら異なる形で定義していたかもしれませんが。

```javascript:eslint-local-rules/index.js
"use strict";

module.exports = {
  "no-process-node-env": require("./rules/no-process-node-env.js"),
};
```

これを直接flat configに移行するにはこうします。特別なライブラリは必要ありません。

```javascript:eslint.config.json
// eslint-local-rules/index.jsがCommonJSなのでCommonJSの記法を利用している。
const localRules = require("./eslint-local-rules");
modules.exports = [
  ...,
  {
    plugins: {
      localRules: {
        rules: localRules,
      },
    },
    rules: {
      "localRules/no-process-node-env": "error",
    },
  },
  ...
]
```

このような感じで、`plugin`に設定します。`plugin`以下のキーがそのままプラグインの名前になり、`rules`以下に記載するときのスラッシュの前の名前になります。その後`rules`にエクスポートしたものを入れて上げればOK。

## もう少し詳しく

[Plugin Migration to Flat Config](https://eslint.org/docs/latest/extend/plugin-migration-flat-config)ではPluginをFlat Configに対応するための方法が記載されています。自作ルールもプラグインはプラグインですのでこちらを確認すればよいです。

上記では`plugins`に`rules`を設定していましたが、それ以外にも`configs`と`processors`、`meta`が設定可能です。`meta`はメタ情報ですので、公開する場合は`name`や`version`の設定が推奨されていますが、通常であれば、特に自作ルールの場合は`rules`だけで十分でしょう。

しかしながら、もう少しかっこよくする場合は下記のように設定すればよいです。

```javascript:eslint-local-rules/index.js
const rules = {
  "no-process-node-env": require("./rules/no-process-node-env.js"),
};

const plugin = {
  rules,
}

export default Object.assign(plugin.configs, {
  recommended: {
    plugins: {
      localRules: plugin
    },
    rules: {
      "localRules/no-process-node-env": "error",
    }
  }
})
```

```javascript:eslint.config.json
// eslint-local-rules/index.jsがCommonJSなのでCommonJSの記法を利用している。
const localRules = require("./eslint-local-rules");
modules.exports = [
  ...,
  localRules.configs.recommended,
  ...
]
```

社内用やチーム全体で使う場合みたいなルールの場合はこれぐらいやると親切かもしれません。
