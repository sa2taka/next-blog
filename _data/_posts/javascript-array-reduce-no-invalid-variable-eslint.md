---
layout:      post
title:       JavaScriptのArray#Reduceの関数内で第二引数の変数を利用した場合エラーになるESLintのルール
author:      sa2taka
category:    typescript
tags:        javascript,typescript,eslint
public:      true
createdAt:   2022-12-18
updatedAt:   2022-12-18
latex:       false
description:
  配列のメソッド、Reduceに関して、バグを短期間で二回も埋め込んでしまいました。それを回避するため、reduce用のLintを書いたので紹介です。  
---

ハローワールド

JavaScript/TypeScriptに関わらず、現在のモダン言語には配列の操作の関数/メソッドとして `reduce` が存在します。

`reduce` の解説は至るところにありますので省くとして、最近僕がよく`reduce` でハマっているポイントが有り、それを解消するためのESLintのルールを作成しました。

# Reduceにおけるミス

下記のようなモデルのデータがあるとします。現実的な例ではありませんが、動物園の名簿管理とします。動物園には`cat`と`lion`と`tiger`がいて、それぞれの動物の名前が配列で付いているとします。

```typescript
type AnimalNames = {
    cat: string[],
    lion: string[],
    tiger: string[],
}

const animalNames: AnimalNames = {
    cat: ["タマ", "ポチ"],
    lion: []
    tiger: ["トラッキー"]
}
```

この名前を追加・削除をする共通処理として下記のような関数があるとします。

```typescript
const addName = (animalNames: AnimalNames, target: "cat" | "lion" | "tiger", name: string): AnimalNames => { 
  return {
    ...animalNames,
    [target]: animalNames[target].concat(name),
  }
}
```

この時、不特定多数の動物・名前を一気に追加したい処理が発生しました。reduceを利用して下記のように実装しました。

```typescript
type Info = {
    target: "cat" | "lion" | "tiger";
    name: string;
}
const addNames = (animalNames: AnimalNames, data: Info[]) => {
  data.reduce((accAnimalNames, addInfo) => {
    return addName(animalNames, addInfo.target, addInfo.name);
  }, animalNames);
}
```

さて、上記の`reduce`なのですが処理が間違っています。

下記のように処理を行ったところ、下記のような結果となってしまいました。`cat`に「ハチ」を追加したかったのですが、ハチが追加されていません。

```typescript
const newNames = addNames(
    animalNames,
    [
        { target: "cat", name: "ハチ" },
        { target: "lion", name: "リオン" }
    ] 
)
console.log(newNames);
// => {
//       cat: ["タマ", "ポチ"], // ← "ハチ" が追加されていない
//       lion: ["リオン"],
//       tiger: ["トラッキー"]
//    }
```

原因は下記の通り、`accAnimalNames`を使うべきところに`animalNames`を使ってしまっていることです。すなわち、初期値に対して毎回毎回更新を行っており、それ以前の更新処理はすべて失われてしまっています。

```typescript
const addNames = (animalNames: AnimalNames, data: Info[]) => {
  data.reduce((accAnimalNames, addInfo) => {
    // animalNamesに値を追加している。本来ならaccAnimalNamesに値を追加しなければならない
    return addName(animalNames, addInfo.target, addInfo.name);
  }, animalNames);
}
```

上記に関してはモデルが悪いとか操作の方法が悪いとかあると思います。また、単純に`reduce`を使うのが悪いということで、[reduceを禁じるlint](https://www.npmjs.com/package/eslint-plugin-no-array-reduce)なんかもあったりします。for-ofとかで代用できるよね、ということで。

しかし、個人的にはreduceはあんまり禁じたくないです。なので、「**reduceの第二引数に指定された初期値を、第一引数の関数内で利用されたら問題とする**」というlintを作成すれば上記を回避できるのでは? と考え、今回lintを作成しました。

# Reduceの第二引数に指定された初期値を、第一引数の関数内で利用されているかを検知するルール

上記の問題を検知するためのルールを作成したのが下記です。ちなみに、下記をインストールしても、特にESLintで動くとかない(そもそもライブラリを公開していない)ので、あくまでコードの参考となれば。

https://github.com/sa2taka/no-invalid-reduce-variable-eslint-rule

上記のコードのテスト[^test-code]を確認すれば、どの場合にエラーになるかなどがわかります。

[^test-code]: テストコードがarrow function(`() => { }`)でなくて普通の匿名関数(`function () { }`)を利用している理由は、なぜかarrow functiondだとテストが動かないからです。lintとして動かす場合は問題なく動きます

## Fail

第一引数が関数内で利用される場合はエラーになります。

```typescript
arr.reduce(function(acc) { return count }, count)
```

第二引数が配列でも動作します。

```typescript
arr.reduce(function(acc) { return [count1, count2] }, [count1, count2])
```

第二引数がオブジェクトの場合は、オブジェクトの値に指定されている変数が利用されていないかを確認します。キーは当然ながら確認しません。

```typescript
arr.reduce(function(acc) { return { count: count1 } }, { count: count1 })
```

第二引数のプロパティを参照する場合も問題とします。

```typescript
arr.reduce(function(acc) { return obj.count }, obj)
```

第二引数がプロパティ参照(Member Expression)の場合は、Member Expression全体が一致しているかを確認します

```typescript
arr.reduce(function(acc) { return obj.count }, obj.count)
```

## Success

通常通りやれば特に問題ないです。

```typescript
arr.reduce(function(acc) { acc }, count);
```

第二引数がリテラルな場合、同じリテラルを利用しても特に問題ないです。

```typescript
arr.reduce(function(acc) { return acc + 1 }, 1);
```

第二引数がオブジェクトの場合、オブジェクトのキーなどで検知されることはありません。

```typescript
arr.reduce(function(acc) { return { count: acc } }, { count: count1 });
```

第二引数と、第一引数の関数の引数が同じ場合、特にエラーとしません。

```typescript
arr.reduce(function(count) { return count }, count);
```

第二引数がMember Expressionの場合、第二引数のMemberExpressionのオブジェクトを利用していても特に問題ありません。

```typescript
arr.reduce(function(acc) { return obj }, obj.count);
```

第二引数がMember Expressionの場合、第二引数のMemberExpressionのプロパティと同名の変数を利用していても特に問題ありません。

```typescript
arr.reduce(function(acc) { return count }, obj.count);
```

第二引数が空の配列で、関数内で空の配列を利用していても問題ありません。

```typescript
arr.reduce(function(acc) { return [] }, []);
```

第二引数が空のオブジェクトで、関数内で空のオブジェクトを利用していても問題ありません。

```typescript
arr.reduce(function(acc) { return {} }, {});
```

## ルールを適用

ルールを適用した上で、上の`addNames`にlintをかけて見ましょう。

![addNames lint error](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/addNames%20lint%20error.png)

# 作成ノート

今回ルールを作成する上で、若干困ったもののメモです。

下記は前提として、[Custom ESLint RuleをTypeScriptで作りたい](https://blog.sa2taka.com/post/custom-eslint-rule-with-typescript/)の内容が含まれています。この記事はESLintのルールを作成する手順みたいなものです。

## 子供を再帰的に探索する方法がわからなかった

上記のルールを作成する際ですが、一番困ったのが再帰的に子供を読んでいく動作です。
今回は`CallExpression`をキャッチして検知を行うのですが、第一引数の関数を掘っていき、変数名などを取得していく方法がわかりませんでした。

色々調べると、その動作のことを`visit`と呼ぶことがわかりましたが、それ用のライブラリがあんまりありませんでした。パッと見つかった処理参考にして、完成したのが下記です。

https://github.com/sa2taka/no-invalid-reduce-variable-eslint-rule/blob/main/src/visit.ts

動作を見るとすごーく単純で、`for-in`を利用し、対象のプロパティをすべて調べます。その中でNodeっぽい値(具体的にはオブジェクトでプロパティ`type`が空文字以外の文字列の場合)に関して、同じことを行います。ESLintの場合は特殊で`parent`に親の情報が詰まっているので、それを省いています。
