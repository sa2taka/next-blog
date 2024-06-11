---
layout:      til
title:       VSCodeでyamlを開いた際、候補を表示しない
category:    vscode
createdAt:   2024-06-11
updatedAt:   2024-06-11
---

yamlを編集していると候補が邪魔をしてきて鬱陶しかったので設定を入れた。
下記を記載すると、入力するだけで候補の表示がされなくなる。Macであれば `ctrl-space`（入力ソースの変換と被っているが）で候補は表示される。

```json:settings.json
  "[yaml]": {
    "editor.quickSuggestions": {
      "comments": "off",
      "strings": "off",
      "other": "off"
    }
  }
```

P.S.
1回上記の設定を入れた後に無効化しても全然候補が表示されなくなった。

今回参考にしたのは下記の記事。

- https://note.com/zen22vv/n/nbd3b3aad3324
