---
layout:      til
title:       XvfbによるElectronのヘッドレス化（Playwright × ElectronをDocker上で動かす）
category:    Electron
createdAt:   2024-10-20
updatedAt:   2024-10-20
---

Electronにはヘッドレスモードはない。そのため、GUIの無いシステムではElectronを使うこともできないわけで。たいてい問題はないが、つまりDocker上で動かすことができないということになる。

[Xvfb](https://www.x.org/archive/X11R7.7/doc/man/man1/Xvfb.1.xhtml)はX Virtual FrameBufferのことで、X Window Systemの仮想ディスプレイのサーバーである。これを使うことでElectronをヘッドレスモードで動かすことができる。下記のドキュメントを参照。

https://www.electronjs.org/ja/docs/latest/tutorial/testing-on-headless-ci

具体的にPlaywright × ElectronをDocker上で動かせるようにしたいときに使える。下記はDockerfileの例（`yarn e2e` でPlaywrightのテストを実行することを想定している）。

```dockerfile
FROM mcr.microsoft.com/playwright:latest@

WORKDIR /app

RUN apt-get install -y xvfb

RUN npm uninstall -g yarn \
  && rm -rf /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY ./package.json ./package.json

RUN corepack enable \
  && corepack install 

RUN yarn install --immutable

RUN yarn playwright install chromium

COPY . .

CMD ["xvfb-run", "yarn", "e2e"]
```

**注意するべきは**これだと動かない場合がある。というのもDockerの実行プロセスがPID 1で動いておりシグナルハンドルが出来ないから...だと思う。[--initオプション](https://docs.docker.com/reference/cli/docker/container/run/#init)を付与すると動くようになるので、多分そうだと思う。

後もう1つ、大抵の場合はWindowsで動かす場合が多いので、お手持ちのCIのWindows環境で動かすほうがいいと思う。Github Actionsであれば[windows環境がある](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)。
