---
layout:      til
title:       package.jsonのdependenciesのバージョンをpinするシェルワンライナー
category:    javascript
createdAt:   2024-10-09
updatedAt:   2024-10-09
---

Renovateでは[依存関係をpinすることを推奨していますし](https://docs.renovatebot.com/dependency-pinning/)、yarnでは[defaultSemverRangePrefix](https://yarnpkg.com/configuration/yarnrc#defaultSemverRangePrefix)によりデフォルトでバージョンを固定化出来ます。

しかしこういった設定をする前にあれこれインストールしてしまって、後からpinするの、ちょっと面倒ですよね。renovateが勝手にやってくれるはずなんですが、なんかやってくれないし。
下記はそれをやってくれるコマンドです。

```bash
#!/bin/bash

while read -r package current_version; do                                                                                 
  latest_version=$(yarn info "$package" version --json | jq -r '.children.Version')     
  jq --arg package "$package" --arg latest_version "$latest_version" '.dependencies[$package] = $latest_version' package.json > tmp.json && mv tmp.json package.json
done < <(jq -r '.dependencies | to_entries[] | "\(.key) \(.value)"' package.json)   
```

注意点として下記があります。

- `jq`が必要です
- `dependencies` を対象としています
    - 2行目・4行目の`dependencies`を`devDependencies`に書き換えれば`devDependencies`を対象に出来ます
- `yarn`を利用しています
    - `pnpm`の場合は[list](https://pnpm.io/ja/cli/list)が使えると思います
    - その場合2行目の`jq`のコマンドもおそらく変える必要があります
