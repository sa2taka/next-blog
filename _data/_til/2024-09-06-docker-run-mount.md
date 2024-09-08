---
layout:      til
title:       DockerでCOPYを用いずにpackage.jsonを使ってyarn installする（RUN実行時に一時的にマウントする）
category:    docker
createdAt:   2024-09-06
updatedAt:   2024-09-06
---

Dockerについて半日ぐらい調べたときの成果2。`RUN --mount`について。

COPYコマンドは最終成果物に含まる。例えば、`COPY . .` で全てのファイルをコピーすると、最終成果物には全てのファイルが含まる。これは不要なファイルが含まれるため、最終成果物のサイズが大きくなる。マルチビルドステージにより解決できるが、それ以外にも `RUN --mount` を使うことで解決可能だ。
基本的には[公式ドキュメント通り](https://docs.docker.com/build/building/best-practices/#add-or-copy)だが、下記のようにすると、`pakage.json`を成果物に含めずに`yarn install`が可能だ。

```dockerfile
FROM node:22 AS build

RUN --mount=type=bind,source=./package.json,target=./package.json yarn install
```

ただし`--mount`と`COPY`で**大きく違うところが1つあり**、**既存のディレクトリをtargetとしたときの挙動**である。
COPYは[リファレンス](https://docs.docker.com/reference/dockerfile/#copy)内にて下記のように記載されている。

> If it contains subdirectories, these are also copied, and merged with any existing directories at the destination. Any conflicts are resolved in favor of the content being added, on a file-by-file basis, 
> > サブディレクトリが含まれている場合、**それらもコピーされ、コピー先の既存のディレクトリとマージされます**。競合がある場合は、ファイルごとにコンテンツが追加されるように解決されます。

一方でRUN --mount、正確にはbind mountについては[リファレンス](https://docs.docker.com/engine/storage/bind-mounts/#mount-into-a-non-empty-directory-on-the-container)にて下記のように記載されている。

> If you bind-mount a directory into a non-empty directory on the container, the directory's existing contents are obscured by the bind mount.
> > コンテナ内の空でないディレクトリにディレクトリをバインドマウントすると、**ディレクトリの既存の内容がバインドマウントによって隠されます**。

つまり、**COPYはディレクトリをマージするが、--mountはディレクトリを上書きするような挙動になる**。
