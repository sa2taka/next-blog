---
layout:      til
title:       iframeに直接htmlを渡す
category:    html
createdAt:   2025-03-14
updatedAt:   2025-03-14
---

受け取ったHTMLメールをReactで作ったアプリで表示したい欲求が有りました。受け取ったHTMLしか表示しないので、最悪`dangerouslySetInnerHTML`でもいいっちゃ良いんですが、流石に少しは安全に倒したい。ということで、iframeの[sandbox](https://developer.mozilla.org/ja/docs/Web/HTML/Element/iframe#sandbox)を利用したいなと思いました。が、iframeは`src`にhtmlのリンクを渡す必要があり、React上で管理しているHTMLの文字列を渡す方法はねぇかなと思いました。

MDNを眺めてると[srcdoc](https://developer.mozilla.org/ja/docs/Web/HTML/Element/iframe#srcdoc)という属性がありました。

> インラインHTMLを埋め込み、srcの属性を上書きします。その内容は完全なHTMLドキュメントの構文に従う必要があります。※日本語のMDNだとなんか日本語がよくわからなかったので少し書き換えてます 

HTMLをインラインで記載できるドンピシャのattributesがありました。下記のようにすればHTMLを表示しつつスクリプトの実行を抑制できます。

```typescript
const HtmlMailPreview = () => {
  return <iframe
    srcDoc={'<h1>メールのタイトル</h1><script>alart("script!")</script>'}
    sandbox=""
  />
}
```
