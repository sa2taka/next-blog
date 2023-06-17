---
layout:      post
title:       Node.jsのfsモジュールをモックしてテストする: mock-fsモジュールのすゝめ
author:      sa2taka
category:    typescript
tags:        JavaScript,TypeScript,Node.js
public:      true
createdAt:   2022-07-10
updatedAt:   2022-07-10
latex:       false
description:
  Node.jsでフォルダ構造が重要なアプリのテストは、fsのモックが億劫で手を付けられません。しかし、mock-fsを利用すると簡単にモックが作れます。  
---

ハローワールド

[JavaScript/TypeScriptでテスト・コード間を移動するwith VSCode拡張の作り方](https://blog.sa2taka.com/post/javascript-typescript-jump-between-test-and-code-with-vscode/)で紹介をしましたが、現在私はJavaScript/TypeScriptで通常のコードとテストコードを行き来するためのVSCode拡張を作成しています。

現在v0.2系となり、テストファイルがなかった場合はテストファイルを作成するようになりました。ただし、開発者特権で一部のファイルの書き方のみの対応です。

上記の拡張なのですが、テスト支援のためのツールなのに、拡張自体のコードにテストがありませんでした。
今回はそのテストを作成する上で非常に役にたったライブラリ、[mock-fs](https://www.npmjs.com/package/mock-fs)の紹介をします。

# なぜテストがなかったのか

Railsは通常のコードに対して、テストのパスは一意に決まります： `app/controllers/users_controller.rb`であれば`spec/controllers/users_controller_spec.rb` (RSpecの場合）。

しかしながら、JavaScript/TypeScriptは単純ではありません。
例えば、著名なテストライブラリである[jest](https://jestjs.io/ja/)では、デフォルトでテストファイルは`__tests__`以下にあるファイルか、`.test.ts`または`.spec.ts`とつくものです。また、この設定は簡単に変えることができるので`tests`フォルダ以下にあるものでもいいですし、`_my_test.ts`がつくファイルにしてもいいわけです。

上記の拡張では、流石にその無限にもあるファイルには対応できないので、一般的に利用されている多くのパターンに対応しています。
例えば`src/domein/models/user.ts`に対しては、下記が変換できます[^config][^hit-many]。

[^config]: もちろんある程度の設定は可能で、テストのルートフォルダ（`__tests__`など）の名前やテストのファイル名のプリフィックス（デフォルト`.test`)を変えることができます。
[^hit-many]: 複数ヒットする場合はソースコードの実装に依存してどれか1つが選ばれます。基本的には同じフォルダ内にあるプリフィクス付きのテストファイルが最優先され、ファイルがある場所に近い方の__tests__フォルダが優先されます。なので表の下から優先的に選ばれます。

- `__tests__/domain/models/user.ts`
- `__tests__/domain/models/user.test.ts`
- `__tests__/src/domain/models/user.test.ts`
- `src/__tests__/domain/models/user.test.ts`
- `src/domain/models/__tests__/user.test.ts`
- `src/domain/models/user.test.ts`

これを変換するためには、どうしても実際のフォルダ構造を見る必要がります。具体的には実装では同じフォルダに同じ名前で`.test`がついているファイルを探したり、`__tests__`フォルダを探したりしています。

つまり、実際のフォルダ構造に依存してこの拡張は動いているため、テストを作る際は、実際にテスト用にフォルダ構造を予め作る、もしくはfs[^fs-node]を頑張ってモックする必要があり、億劫だったのでやっていませんでした。

[^fs-node]: fsモジュールはnode.jsのモジュールで、ファイルに関するモジュール。ファイルの作成や読み取り、フォルダの読み取りなどが行えます。

# mock-fs ライブラリの紹介

[mock-fs](https://www.npmjs.com/package/mock-fs)はその名の通り、fsモジュールをモックしてくれるライブラリです。

インターフェースは下記のように、基本的に非常に直感的です。またメモリ上に展開してくれるため、実際にフォルダやファイルが作成されることもないため、フォルダ構造はクリーンなまま、フォルダ構造に関するテストができます。

```javascript
const mock = require('mock-fs');

mock({
  'path/to/fake/dir': {
    'some-file.txt': 'file content here',
    'empty-dir': {/** empty directory */}
  },
  'path/to/some.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
  'some/other/path': {/** another empty directory */}
});
```

今回、テストを書く上で詰まった点が何個か合ったので、解決策と合わせて記載していきます。

## ルートフォルダ

単純にmockをした時、勝手にルート（`/` or `C:\`)を起点に作成されると勝手に思っていました。
ドキュメントを読むと、しっかり`process.cwd()`を起点にする、と書いてありました。

下記のコードを実行してみると、`process.cwd()`下に作られていることが分かります。

```javascript
import * as mockFs from 'mock-fs';
import * as fs from 'fs';

mockFs({
  'path/to/test': '',
});

console.log(fs.readdirSync(process.cwd())); // => [ 'path' ]
```

## フォルダがネストすると挙動が怪しくなる

例えば下記の書き方だと `path`と`path/to`と`path/to/test`のすべてのファイルが作成される用に見えます。

```javascript
mockFs({
  root: { 'path/to/test': '' },
});

try {
  console.log(fs.statSync(path.join(process.cwd(), 'root')));
} catch {
  console.error('root error');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path')));
} catch {
  console.error('root/path error');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path', 'to')));
} catch {
  console.error('root/path/to error');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path', 'to', 'test')));
} catch {
  console.error('root/path/to/test error');
}
```

しかしながら、root/以降は全部エラーになります。

```plaintext:結果
Stat {
...
}
root/path error
root/path/to error
root/path/to/test error
```

どうやらこう書くと`root`フォルダの下に`path/to/test`フォルダ（ファイル）が出来上がるようです（`/`がフォルダ区切りじゃなくなっている）。

これは2つの解消の方法があり、僕は前者で行いましたが、明らかに後者の方が賢いです（この記事書くときに調べて分かりました）。

### 1ネスト1フォルダにする(not オススメ)

下記のようにするとうまく動きました。

```javascript
mockFs({
  root: {
    path: {
      to: {
        test: '',
      },
    },
  },
});

try {
  console.log(fs.statSync(path.join(process.cwd(), 'root')));
} catch {
  console.error('root');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path')));
} catch {
  console.error('root/path');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path', 'to')));
} catch {
  console.error('root/path/to');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path', 'to', 'test')));
} catch {
  console.error('root/path/to/test');
}
```

```plaintext:結果
Stat {
...
}
Stat {
...
}
Stat {
...
}
Stat {
...
}
```

しかし、毎回この書き方をするのはとても不便なので、下記のようにファイル名から上記の構造を作成するようなメソッドを作成しました。
モックは、一度に全部行わないといけないので、2つ以上の引数を取る関係上、オブジェクトのdeepMergeが必要になりました。deepMergeは[lodash](https://lodash.com/)のmergeメソッドを利用します。

```typescript
import { merge } from 'lodash';
import { DirectoryItem, DirectoryItems } from 'mock-fs/lib/filesystem';
import * as path from 'path';
import * as mockFs from 'mock-fs';

export const mockFiles = (...filePaths: string[]): void => {
  const nestedFiles = filePaths.map((filePath) => {
    const divided = filePath.split(path.sep).filter((name) => name !== '');
    return divided.reverse().reduce<DirectoryItem>((acc, dir) => ({ [dir]: acc }), '');
  });

  const files = nestedFiles.reduce<DirectoryItems>((acc, object) => merge(acc, object), {});

  mockFs(files);
};
```

ですが、**オススメはしません**。**下記のほうが楽だからです**

### ネストをしない

この記事を書くときに調査をしたら、ネストをせずにわたすと、どうやらフォルダを作成してくれるようです。
ちなみに、バグっぽい動きなんでIssueを立てようとして、建てる前にIssueを検索したら既存の物がありました： https://github.com/tschaub/mock-fs/issues/354 。ちゃんと調べないとだめですね。

```javascript
mockFs({
  'root/path/to/test': '',
});

try {
  console.log(fs.statSync(path.join(process.cwd(), 'root')));
} catch {
  console.error('root');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path')));
} catch {
  console.error('root/path');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path', 'to')));
} catch {
  console.error('root/path/to');
}
try {
  console.log(fs.statSync(path.join(process.cwd(), 'root', 'path', 'to', 'test')));
} catch {
  console.error('root/path/to/test');
}
```

```plaintext:結果
Stat {
...
}
Stat {
...
}
Stat {
...
}
Stat {
...
}
```

## globライブラリ

これは、詰まった点というよりかは心配な点でした。

私の拡張は[glob](https://www.npmjs.com/package/glob)ライブラリを利用しています。これが正常に動くか心配でした。
globモジュールは内部的にfsモジュールを利用しているようで、特に何の設定も必要なく動きました。

## 終わりに

単純にファイルを利用する（画像を読み込むとか、変換して保存する）などの場合にももちろん使えますし、フォルダ構造が重要なときは特に真価を発揮するかなぁと思うので、fs-mock使ってみてください。

あと、[js go to test](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-go-to-test)も使ってみてください。
