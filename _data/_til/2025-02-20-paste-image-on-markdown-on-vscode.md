---
layout:      til
title:       VSCodeでマークダウンを記載しているときに、コピペで画像を貼り付ける方法
category:    vscode
createdAt:   2025-02-20
updatedAt:   2025-02-20
---

VSCodeの[2023-05の1.79のバージョンアップ](https://code.visualstudio.com/updates/v1_79#_copy-external-media-files-into-workspace-on-drop-or-paste-for-markdown)にて、マークダウンに画像などのメディアファイルを貼り付けられるようになったらしい。

画像や、画像ファイルをコピーした後Markdown上で貼り付けると `![image](image.png)` という形で文言が記載され、画像自体も同一ディレクトリの保存されるようになる。

ディレクトリの保存先を変えるには下記のような設定を入れれば良い。下記は本ブログに関する設定だ。

```json:settings.json
  "markdown.copyFiles.destination": {
    "/_data/**/*.md": "/_data/_images/${fileName}"
  },
```

ちなみにすごいのが、シンボルの対応にも変更している点。画像のパス上で `Cmd-r`（macOSのデフォルト、シンボルの名前変更機能）を行いファイルパスを変更すると、画像も自動的にそこへ移動する。そのため貼り付けた後に画像ファイル名を変更する際も楽ちんだ。
