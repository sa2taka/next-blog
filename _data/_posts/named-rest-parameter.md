---
layout:      post
title:       残余引数/可変長引数（Rest parameter）のそれぞれの引数に任意の名前を付与する（ラベル付きタプルの話）
category:    typescript
author:      sa2taka
tags:        typescript
public:      true
createdAt:   2024-09-27
updatedAt:   2024-09-27
latex:       false
description:
   残余引数/可変長引数（Rest parameter）には、要素一つ一つに引数に任意の名前を付与することができるので、その方法を紹介します。
---

[残余引数/可変長引数（Rest parameter）](https://typescriptbook.jp/reference/functions/rest-parameters) は、関数に可変長の引数を受け取ることができる機能です。この機能を利用することで、関数に可変長の引数を受け取ることができます。

```typescript
function sum(...args: number[]) {
  return args.reduce((acc, cur) => acc + cur, 0);
}

console.log(sum(1, 2, 3)); // 6
```

では、この時、`sum` 関数の引数の名前はどうなっているでしょうか？VSCodeで定義を書くにすると、 `...args` という名前になっています。わかりやすいですね。

![残余引数の名前。 `...args: number[]` という引数指定だと、 `...args` というのが引数の名前となっています。](../_images/simple-rest-parameter.png)


では、下記のように、 `number[]` ではなく `[number, number, number]` という型を指定した場合はどうなるでしょうか？

```typescript
function sum(...args: [number, number, number]) {
  return args.reduce((acc, cur) => acc + cur, 0);
}

console.log(sum(1, 2, 3)); // 6
```

引数の名前は `args_1`, `args_2`, `args_3` という名前になっています。ちなみにVSCodeのinlay hintには引数名が表示されていません。なのでどちらかと言うと「無名の引数」という感じです。

![残余引数の名前。 `...args: [number, number, number]` という引数指定だと、 先頭からそれぞれの引数にargs_1, args_2, args_3という名前になっています](../_images/fixed-rest-parameter.png)

今回はこの `args_1` に名前をつけるお話です。

# 残余引数の要素に名前を付与する

では、下記のように `[num1: number, num2: number, num3: number]` というような型を指定するとどうなるでしょうか？

```typescript
function sum(...args: [num1: number, num2: number, num3: number]) {
  return args.reduce((acc, cur) => acc + cur, 0);
}

console.log(sum(1, 2, 3)); 
```

画像のように、記載した名前がそのまま引数の名前になります。

![残余引数の名前。 `...args: [num1: number, num2: number, num3: number]` という引数指定だと、 先頭からnum1, num2, num3という名前になっています](../_images/labeled-rest-parameter.png)

# ラベル付きタプル

これはTypeScript 4.0で登場したラベル付きタプルという構文です。TypeScript 4.0というと`Variadic Tuple Types`という、ジェネリクスに対する可変長の型と、末尾以外の箇所の可変長の型を指定する機能が目玉機能でしたね。

https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#labeled-tuple-elements

このラベル付きタプル（Labeled Tuple）は上記に記載した以上のものはなく、開発者の体験向上が目的のとなっています。[^labeled-tuple]

[^labeled-tuple]: ちなみにASTでは `NamedTupleMember`という要素名になっています。

# 使い所

EventEmitterのようなもので効力を発揮すると思います。下記のような実装ができます。正直実装は `as` をめっちゃ指定しているのであまり良くないですが、JavaScriptの実装に型を指定する場合は良いかなと思います。

```typescript
type Events = {
  click: {
      args: [target: string, mousePosition?: { x: number, y: number }],
      result: { clicked: boolean },
  },
  type: {
      args: [target: string, key: "Enter" | "Tab"],
      result: { typed: boolean },
  }
}


function on<T extends keyof Events>(event: T, ...args: Events[T]["args"]): Events[T]["result"] {
  switch(event) {
    case "click": 
      return click(...(args as Events["click"]["args"])) as Events["click"]["result"]
    case "type":
      return type(...(args as Events["type"]["args"])) as Events["type"]["result"]
    default:
      throw new Error("Invalid event")
  }
}

on("click", "button", { x: 10, y: 20 })
on("type", "input", "Enter")
```

VSCodeで開くと画像のようにinlay hintで適切な引数名が表示されます。

![上記の`on`関数を呼び出している部分。eventがclickならtargetとmousePositionが、eventがkeyならtargetとkeyが表示されています](../_images/labeled-tuple-usage.png)
