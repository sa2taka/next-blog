---
layout:      til
title:       VSCodeにおいてTypeScriptの自動インポート対象から省きたい場合
category:    typescript
createdAt:   2023-08-27
updatedAt:   2023-08-27
---

`autoImportFileExcludePatterns` というフラグがある。これを設定することで、自動インポートの対象から省かれDX（Developer eXperience）が向上する。

例えば、`User` というよくあるクラス名は既存のライブラリからもExportされていることが多い（`Sentry` や `DataDog` など）。
これらを指定すればそれらのライブラリからの自動インポートを省いてくれる。

弱点としてはVSCodeにしか対応していない（正確に言えばTS Serverのオプションなので設定さえすればVimとかでも問題ないとは思う）のと、ライブラリごと省かれてしまうこと。
どうしても回避したいなら独自のTS Language Server Pluginを書けば良いと思うが...。

ちなみにTypeScript4.8以降の機能。
https://devblogs.microsoft.com/typescript/announcing-typescript-4-8-rc/#exclude-specific-files-from-auto-imports
