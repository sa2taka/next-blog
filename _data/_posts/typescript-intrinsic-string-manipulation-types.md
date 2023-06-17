---
layout:      post
title:       知られざるTypeScriptの組み込み型と活用法 〜 組み込み文字列操作型
author:      sa2taka
category:    typescript
tags:        typescript
public:      true
createdAt:   2022-08-19
updatedAt:   2022-08-19
latex:       false
description:
  「私が」知らなかった`Uppercase`などの文字列に関連する組み込み文字列操作型について活用方法等をセットで記載しています。  
---

ハローワールド

知られざる、というのはあくまで「僕が」という話ですが、最近知った組み込み型、[Intrinsic String Manipulation Types(組み込み文字列操作型)](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#intrinsic-string-manipulation-types)を紹介します。

# 組み込み文字列操作型

TypeScript 4.1では [Template String Type](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)が追加されました。TypeScriptの型の幅がぐっと広がるアップデートで、かなり話題になったのも記憶に新しいですね。

正直このTypeScript 4.1のアップデートが来た今から2年前は、TypeScriptを本格的に追いかけていたわけではないので見逃していたのですが、このアップデートで4つの組み込み系が増えました。
下記がその4つですが、文字通りの機能を持っています。

- `Uppercase`
- `Lowercase`
- `Capitalize`
- `Uncapitalize`

使い所は難しいですが、使い方によっては便利なものなので紹介します。

## UpperCase・LowerCase

`Uppercase`・`LowerCase`は文字通り、型パラメータに指定した文字列をすべて大文字・小文字にしてくれるものです。

[Playground Link](https://www.typescriptlang.org/ja/play?#code/C4TwDgpgBAysBOUC8UBEAJA9gc2gMQFdsBDVAKFEigFUxJ45EVb6BjYgZwgB5GA+ANxkA9MKjioAPQD8ZCuGgAZTAHcIDBMijK18dl14I+IsRJlA)

```typescript
type Str = "Hoge Fuga"
type UpperStr = Uppercase<Str>;
//    ^? type UpperStr = "HOGE FUGA"

type LowerStr = Lowercase<Str>
//    ^? type LowerStr = "hoge fuga"
```

## Capitalize・Uncapitalize

`Capitalize`・`Uncapitalize`も文字通り、型パラメータに指定した文字列の先頭の文字を大文字・小文字にしてくれるものです。注意点としては、空白区切りだったり、CamelCaseやsnake_caseなどいずれの場合も先頭のみ大文字になることです。

[Playground Link](https://www.typescriptlang.org/ja/play?#code/C4TwDgpgBAcg9gJwLYEMA2UC8UBEALOAc2gDMBXQlHAKFEigGEUkI0mBnabfIiAMQpVa4aAGUAdigDWEDl1wFiAfXKUaw+vGTomYAJbB0egF7zdBo6YA8W1GgB81APROobgHoB+DdCYs2KJzmhmgmZij6IWFWfqxyji5uUF4+UBLSsoGZkZbhOaHW6TLxzq4e3qm26ACq4gDGERYF8rUN+dFVAe2mCWXJ3nS+zHFZrY1RplhQY90QMcMBQeO5vUkpg2mSxaP1y81TM03RRZlLs6vlQA)

```typescript
type Normal = "hoge fuga"
type CamelCase = "hogeFuga"
type SnakeCase = "hoge_fuga"

type NormalCapitalize = Capitalize<Normal>
//   ^? type NormalCapitalize = "Hoge fuga"
type CamelCaseCapitalize = Capitalize<CamelCase>
//   ^? type CamelCaseCapitalize = "HogeFuga"
type SnakeCaseCapitalize = Capitalize<SnakeCase>
//   ^? type SnakeCaseCapitalize = "Hoge_fuga"

type NormalUncapitalize = Uncapitalize<NormalCapitalize>
//   ^? type NormalUncapitalize = "hoge fuga"
type CamelCaseUncapitalize = Uncapitalize<CamelCaseCapitalize>
//   ^? type CamelCaseUncapitalize = "hogeFuga"
type SnakeCaseUncapitalize = Uncapitalize<SnakeCaseCapitalize>
//   ^? type SnakeCaseUncapitalize = "hoge_fuga"
```

# `intrinsic`というキーワード

上記の型は、型定義を見ると`intrinstic`(組み込みの・固有の）というものになっています[^lib.d.ts]。`intrinstic`は現在上記で紹介した4つの型のみに使われています。

[^lib.d.ts]: `lib.d.ts`、今回の例は`lib.es5.d.ts`というファイルはTypeScript本体がが持っているJavaScriptランタイムやDOMなどに関する型を持つファイルです。

```typescript:lib.es5.d.ts
/**
 * Convert string literal type to uppercase
 */
type Uppercase<S extends string> = intrinsic;

/**
 * Convert string literal type to lowercase
 */
type Lowercase<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to uppercase
 */
type Capitalize<S extends string> = intrinsic;

/**
 * Convert first character of string literal type to lowercase
 */
type Uncapitalize<S extends string> = intrinsic
```

調べてみるとこれは、`Uppercase`などの上記の型とともに現れたキーワード
本来は `type UpperStr = uppercase "hoge fuga"`のような構文を用いて上記の型を実現するようでしたが、これだと組み込み型が増えるたびに新たな構文ができてしまいます。

そのときに作られたのが `intrinsic`キーワードです。この構文はかなり特殊な挙動をし、「型名」と「型パラメータ」によって挙動が変わります。

[Playground Link](https://www.typescriptlang.org/ja/play?#code/PTAEniGQ1BigzBXAdgYwC4EsD2DB2DIWjlDmDIFnaglf6DqDIGYMgIgyDRDNoPYMgDQyC3DID8MgCwyDXDNoNHqgFgyDVEYEiGQFYMlQBEMgMQZA1gyBNBmqB9BkCBDACh4ydFlAALDAHMApgAoAlKADey0FdAhQAGQwB3fQCckAQwDO+0NkBQcoAfZoCyDJbWKACeAA4+Ds5uXvoAPADKoPoAHij6CAAmnqCeKC5oCLoAfKAAvKAABgA2Tq6gACRmyQC+NQDcoVa2sa4e3nSAhgyAwQyAyQy8gUH4QdS9oBHRoADyAG6ujsVZOQMuVfaN8d6JAEQ6BmdlPdY2YFYAegD8you2JUUlnmhIoIC1DCxAPcMLEAkwyAJIZAP7ygGMGcgzCiAfwYFndlj4AKqRaInJKpDJZXL5QrFUoVaqfYk-JC3ay2QDCirxADAqgA0GQCrSoAdeXBFBoi1Ra02Lm2aF2GKxhxFgwS50uPngunc12pfQeoBei3eYG4gFR9QAOpuDAISOgBHMqSALE1APIMpHkgCiGQCADIBITWEgFgVQCySrJkWEoj4AMLuSJC9x1NAALxxaUy2TyBS+pQANKAACqh-ERoklcqHcnfX6KpYe0AAETgAFtC+F0wgo5Ts7YrIBLBhGgkAQQzxrQ+ADkGYQlNboAA1vpwo4MC4cqAPAhQFg6qWAEY+ODeEcoDCgHL6JB1dwuHxIDCF311JqRFwYdZoVcjjuUnPRTwAOkMACYAOwATgArKZABUMgEuGFiAGQZAC83QB8V2UdogA)

```typescript
// わざわざfunctionの中で定義しているのはグローバルの型と被らないようにするため
function hoge() {
    // Lowercase の上書き
    type Lowercase<S extends string> = `lower ${S}`;
    // Lowercaseはちゃんと上書きできる
    type OverwritedLower = Lowercase<"hoge">;
    //   ^? type OverwritedLower = "lower hoge"

    // intrinsic キーワードを使って上書きしてみる
    type Uppercase<S extends string> = intrinsic;
    // 元と同じ動作をしている
    type OverwritedUpper = Uppercase<"hoge fuga">;
    //   ^? type OverwritedUpper = "HOGE FUGA"

    // 型引数を無駄に多くしたり、変な名前にする
    type Capitalize<S extends string, T extends string> = intrinsic;
    type Dummy = intrinsic;
    //   どちらも The 'intrinsic' keyword can only be used to declare compiler provided intrinsic types.(2795) エラーが発生
}
```

上記の動作の通り、`intrinsic`キーワードは、特定の型名・特定の型引数を持つ場合、それを実現する型となり、それが定義されていない場合はエラーになります。非常に面白い動きですね。

詳しく知りたい場合はより詳細に記載されている[TypeScript 4.1で密かに追加されたintrinsicキーワードとstring mapped types](https://zenn.dev/uhyo/articles/typescript-intrinsic)の記事がおすすめです。

# 活用例

正直、型レベルで大文字小文字を変換することってそこまで無いので、割と活用することが無いんですよね。

私のチームのプログラムでは、別のチームから受け取る値と我々のチームの値の最初の文字の大文字小文字が違うので、ドンピシャで利用している部分があります。

かなり適当ですが、下記のような感じになります。

```typescript
type ItemValue = "cat" | "dog" | "bird";
type ExternalItemValue = Capitalize<ItemValue>;
//   ^? type ExternalItemValue = "Cat" | "Dog" | "Bird"

type ApiInterface = {
    ...,
    animal: ExternalItemValue,
}

...

const foo = (data: ApiInterface) => {
  const animal = uncapitalize(data.animal);
}
```

## kebab-caseを型レベルでlowerCamelCaseにしてみる

TypeScript 4.1で同時に実装されたTemplate Literal Stringと同時に採用すると結構いろんな事ができます。

例えば、下記のようなURLを持っているとします（あくまでイメージ）。

```
https://sa2taka.example.com/animal/friendly-dog
https://sa2taka.example.com/animal/lonely-cat
https://sa2taka.example.com/animal/noisy-bird
```

この末尾の `friendly-dog`はパスパラメーターとなっていて、このパスパラメーターによって動作が変わる、よくある動作ですね。

今回は、パスパラメーターにアクセスされるたびに、特定のパラメーターのカウントが増えるという動作を考えてみます。
TypeScript(JavaScript)なので、一般的にパラメーターはlowerCamelCaseで記載されるので、下記のようなインターフェースを持つオブジェクトのカウントを増やす、ということにしましょう。

```typescript
type ItemKey = "firendlyDog" | "lonelyCat" | "noisyBird";
type Data = Record<ItemKey, number>;
```

これを用いて下記のように実装しました。

```typescript
type PathParameter = "friendly-dog" | "lonely-cat" | "noisy-bird";
type ItemKey = "friendlyDog" | "lonelyCat" | "noisyBird";
type Data = Record<ItemKey, number>;

const data: Data = {
    friendlyDog: 0,
    lonelyCat: 0,
    noisyBird: 0,
}

// 末尾のパスパラメーターを取得してくれる
const getPathParameter = (url: string): PathParameter =>  { ... }

const convertPathParameterToItemKey = (pathParameter: PathParameter): ItemKey => { ... }

const updateCountControler = (url: string) => {
    // friendly-dogとかを返す
    const pathParameter = getPathParameter(url);
    const itemKey = convertPathParameterToItemKey(pathParameter);

    data[itemKey] = data[itemKey] + 1;
}
```

一件良さそうですし、正直コレでもいいんですが

- `PathParameter`と`ItemKey`に相関があるのに、それをうまく表せられていない
- `convertPathParameterToItemKey`の引数と戻り値に相関があるのに、それをうまく表せられていない

です。これを解消してみましょう。

そのためにkebab-caseをlowerCamelCaseに変換する型があると良さそうですね。

というわけでTemplate Literal StringとCapitalize・Uncapitalize型を利用して作ってみました。

```typescript
type SplitKebab<KebabCase extends string> = KebabCase extends `${infer Head}-${infer Tale}` ? [Head, ...SplitKebab<Tale>] : [KebabCase];
type CapitalizeConcat<T extends string[], ShouldCapitalized extends boolean = true> =
  T extends [infer P, ...infer R]
    ? P extends string
        ? R extends string[]
            ? [] extends R
                ? ShouldCapitalized extends true ? Capitalize<P> : Uncapitalize<P>
                : `${ShouldCapitalized extends true ? Capitalize<P> : Uncapitalize<P>}${CapitalizeConcat<R>}`
            : ''
        : ''
    : ''
type KebabToLowerCamelCase<KebabCase extends string> = CapitalizeConcat<SplitKebab<KebabCase>, false>

type Test = KebabToLowerCamelCase<"hoge-fuga-foo-bar">
// ^? type Test = "hogeFugaFooBar"
```

詳細は説明するのが難しいので「TypeScript再帰」とかで検索すると色々出てきますので気になったらしらべていただければ幸いです。
兎にも角にも`KebabToLowerCamelCase`の型パラメータにkebab-caseを突っ込むとlowerCamelCaseが現れてきます。

上記をちょっと書き直してみるとこんな感じになります。

```typescript
type PathParameter = "friendly-dog" | "lonely-cat" | "noisy-bird";
type ItemKey<P extends PathParameter = PathParameter> = KebabToLowerCamelCase<P>
type Data = Record<ItemKey, number>;

const data: Data = {
    friendlyDog: 0,
    lonelyCat: 0,
    noisyBird: 0,
}

// 末尾のパスパラメーターを取得してくれる
const getPathParameter = (url: string): PathParameter =>  { ... }

const convertPathParameterToItemKey = <P extends PathParameter>(pathParameter: P): ItemKey<P>  => { ... }

const test = convertPathParameterToItemKey("friendly-dog");
//    ^? const test: "friendlyDog"
```

こうすると`PathParameter`と`ItemKey`に相関が現れるため、`PathParameter`に追加したのに`ItemKey`に追加し忘れちゃった、みたいな凡ミスもなくなります。
また、`convertPathParameterToItemKey`の引数と戻り値にも相関を与えたので、引数が`PathParameter`の特定の文字列の場合は、ちゃんとそれに対応した`ItemKey`の値が現れます

::: info
```typescript
type ItemKey<P extends PathParameter = PathParameter> = KebabToLowerCamelCase<P>
```

`ItemKey`は上記のようにかなり回りくどい書き方をしていますが、個人的にはお気に入りの書き方です。これは型パラメータを与えずに`ItemType`と書くと、ちゃんと`ItemType`のすべてが現れますし、型パラメーターである`PathParameter`を指定すると、それに応じた値が現れるという2つの側面を持ちます。これにより`ItemType`すべてを表すUnion Typeと`PathParameter`との関係性の2つを示すことができるため、情報量が多いためです。
:::
