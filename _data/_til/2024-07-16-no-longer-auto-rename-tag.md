---
layout:      til
title:       もうAuto Rename Tagは不要だった
category:    vscode
createdAt:   2024-07-16
updatedAt:   2024-07-16
---

[Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)はVSCodeの著名な拡張の1つです。

上記拡張の[Note](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag#note)にも記載があるのですが、実はこの機能がVSCodeのビルトインとして統合されています。

デフォルトで有効化されていませんが`editor.linkedEditing`という設定をtrueにすることで有効になります。
