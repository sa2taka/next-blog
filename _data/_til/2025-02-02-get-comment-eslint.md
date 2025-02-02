---
layout:      til
title:       ESLintでコメントを取得する方法
category:    eslint
createdAt:   2025-02-02
updatedAt:   2025-02-02
---

`useEffect` に必ずコメントを付与しよう、という文脈で下記の投稿を見ました。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Lintにしてしまうのが良さそうと思ったので<a href="https://t.co/iQROX8PuAS">https://t.co/iQROX8PuAS</a><br>適当に書いた。<br><br>useEffectにはコメントをつけよう - Panda Noir<a href="https://t.co/Ls4cx7i4IG">https://t.co/Ls4cx7i4IG</a></p>&mdash; azu (@azu_re) <a href="https://twitter.com/azu_re/status/1884971820425912351?ref_src=twsrc%5Etfw">January 30, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

ESLintで扱うASTの大元となるESTreeではコメント関連のASTは定義されていない...と思います。そのため、上記を達成するために何をやっているのか気になりました。上記のgistのコードを読めば一目瞭然で、[getCommentsBeforeメソッド](https://eslint.org/docs/latest/extend/custom-rules#accessing-the-source-code)を利用して取得可能なようでした。
この`context`は結構いろいろなメソッドを用意しているようで、祖先を取得できる `getAncestors`（そういや使った記憶があるな）とか色々利用できそうですね。

:::info
TypeScriptのコンパイラはJSDocを[jsDoc](https://github.com/microsoft/TypeScript/blob/739d729ecce60771c23723aad932ab35a34df82d/src/compiler/types.ts#L956)によって取得可能です。[leadingComments](https://github.com/microsoft/TypeScript/blob/739d729ecce60771c23723aad932ab35a34df82d/src/compiler/types.ts#L8260C5-L8260C20)、[trailingComments](https://github.com/microsoft/TypeScript/blob/739d729ecce60771c23723aad932ab35a34df82d/src/compiler/types.ts#L8261)といったものはありますが、これらはEmitNodeという名前から推測するにEmit（TS -> JS）時にしか利用されない特殊なようなものっぽいです。コンパイルしてASTを取得してもコメントは取得できません。
::: 
