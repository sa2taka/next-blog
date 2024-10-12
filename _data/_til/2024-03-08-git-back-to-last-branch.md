---
layout:      til
title:       Gitで最後に触っていたブランチに戻る
category:    git
createdAt:   2024-03-08
updatedAt:   2024-03-08
---

最近よく「一瞬だけこのブランチに移動して、その後もとに戻る」という操作をする。しかし、びっくりするぐらい短期力に難がある私にとって3分前に切り替えたブランチ名は忘れるのである。
調べると最後に触っているブランチへ戻る方法があった。

[ドキュメント](https://git-scm.com/docs/git-switch#:~:text=You%20can%20use%20the%20%40%7B%2DN%7D%20syntax%20to%20refer%20to%20the%20N%2Dth%20last%20branch/commit%20switched%20to%20using%20%22git%20switch%22%20or%20%22git%20checkout%22%20operation.%20You%20may%20also%20specify%20%2D%20which%20is%20synonymous%20to%20%40%7B%2D1%7D.%20This%20is%20often%20used%20to%20switch%20quickly%20between%20two%20branches%2C%20or%20to%20undo%20a%20branch%20switch%20by%20mistake.)

```bash
$ git switch -
# 上は下記の糖衣構文。-1の部分を2とか3とかにすればもっと遡れる。HEADみたいなもんすね
$ git switch -@{-1}
```

またreflogにもログが残っている。

```bash
$ git reflog | grep switch 
12345abce HEAD@{0}: checkout: moving from master to release
```

参考:
https://qiita.com/ginpei/items/2e0cd22df0670b3a1c3f
https://ginpen.com/2022/12/09/git-back-to-last-branch/
https://zenn.dev/yajamon/articles/422ecab49804f9
