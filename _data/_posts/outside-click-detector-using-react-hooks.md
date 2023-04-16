---
layout:      post
title:       Reactで要素の外側をクリックされた時を検知する[React Hooks]
author:      sa2taka
category:    typescript
tags:        React,ReactHooks,TypeScript
public:      true
createdAt:   2020-09-27
updatedAt:   2020-09-27
latex:       undefined
description:
  React Hooksで簡単に要素の外側をクリックされた時に検知できる仕組みを作りました。  
---


ハローワールド

タイトル通りの内容です。

Vuetify[^vuetify]では[Click Outside](https://vuetifyjs.com/ja/directives/click-outside/)として機能があるので、Reactでも似たような感じでできないものかと作りました

[^vuetify]: https://vuetifyjs.com/ja/ Vueのコンポーネントフレームワーク

# 結論

次のようなHook(?)を作ります。

```typescript
import React, { useEffect } from 'react';

export function useOutsideClickDetector(
  ref: React.RefObject<Node>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref]);
}
```

# 使い方

<iframe height="465" style="width: 100%;" scrolling="no" title="OutsideClickDetectorWithReactHooks" src="https://codepen.io/sa2taka/embed/preview/jOqJpVz?height=265&theme-id=dark&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/sa2taka/pen/jOqJpVz'>OutsideClickDetectorWithReactHooks</a> by sa2taka
  (<a href='https://codepen.io/sa2taka'>@sa2taka</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
