---
layout:      post
title:       JavaScript/TypeScriptでテスト・コード間を移動するwith VSCode拡張の作り方
author:      sa2taka
category:    typescript
tags:        JavaScript,TypeScript,VSCode
public:      true
createdAt:   2022-01-09
updatedAt:   2022-01-09
latex:       false
description:
  JavaScript/TypeScriptでテスト・コード間を移動するVSCode拡張が見つからなかったので自作しました。ついでに作り方も。  
---

ハローワールド

TDD(Test Driven Development)、つまりテスト駆動開発は、今や説明不要なプログラミングプラクティスの1つです。
元々はXP(eXtream Programming)の12個のプラクティスの1つで、他にはペアプログラミングなどが有名ですね。

ことRuby on Rails（以下Rails）の話ですが、[Rails Tutorail](https://railstutorial.jp/)という、Railsの著名なチュートリアルサイトでは[TDDを推奨しています](https://railstutorial.jp/chapters/static_pages?version=6.0#sec-getting_started_with_testing)。
またRailsは設定より規約、ということでReactと真逆みたいな思想ですが、そのおかげなのかテストのファイルのルーティングはどのプロジェクトでも大体同じ（2択）です[^rails-test-path]。
その背景があるからか、例えばJetBrainsのRuby MineというIDEでは[Ctrl+Shift+T](https://pleiades.io/help/ruby/navigating-between-test-and-test-subject.html)でテストからテスト対象へジャンプできたり、VSCodeでも[Rails Go to Spec](https://marketplace.visualstudio.com/items?itemName=sporto.rails-go-to-spec)という拡張を利用すると似たようなことができます。

[^rails-test-path]: Rails4あたりの話なので、今とは異なるかもしれません。minitestであれば`test`、RSpecであれば`spec`以下に`app`フォルダを除いたファイルパスと、ファイル名の末尾に`_test`または`_spec`を付けたものです。例： `app/controllers/users_controller.rb`であれば`spec/controllers/users_controller_spec.rb`（RSpecの場合）。

しかし、私の主戦場はJavaScript/TypeScriptです。個人開発ならまだしも、今は会社でカタカタしているのもTypeScriptです。テストもしっかり書かねばなりません。なのでTDDを活用しようと思いましたが、VSCodeでテストを移動するのは、`Cmd-Shift-P`でファイル検索をして移動するのが、おそらく一番はやい方法かと思います。
でも、いちいちファイル名を打ち込むのも面倒くさいし、Railsほどではないにしろ、大体の場合はファイル名の規則は一緒なはずです。でも、探しても、探しても、JavaScript/TypeScriptでそんなことをする拡張はない。いや、絶対あるはずなんですが、少なくとも僕には見つけられませんでした。

なので、今回そんな拡張を作りました。作りました、という報告では寂しいので、今回はn番煎じとなるVSCode拡張の作り方も記載します。
作り方を見たい方は [拡張を作る](#拡張を作る) に記載します。

# 拡張の紹介

[JS go to test](https://marketplace.visualstudio.com/items?itemName=sa2taka.js-go-to-test)は、まえがきに記載した通り、JavaScript/TypeScriptでテストと実装ファイル（以下、コード）を行き来するためのライブラリです[^name]。

拡張ページ：https://marketplace.visualstudio.com/items?itemName=sa2taka.js-go-to-test
ソースコード：https://github.com/sa2taka/js-go-to-test

[^name]: ちなみに命名はRails Go to Specのパクリです。

![動作](https://user-images.githubusercontent.com/13149507/147128991-48006ad3-75e5-4f3d-88a7-217bd7e9a17b.gif)

動作としては上記のgifの通りですが、少し細かい仕様が下記となっています（ソースコードを見るとやってることはそんなに難しくないことがわかります）。
下記が設定で指定可能です。

- 実装ファイルのルート：`src`
- テストのルートリスト：`__tests__`, `__specs__`, `__test__`, `__spec__`, `tests`, `specs`, `test`, `spec`
- テストファイル名のサフィックス：`.test`

下記にプロジェクトパスと記載しているのは、VSCodeで開いているプロジェクトのパスです。`/Users/sa2taka/Documents/project/src/controllers/users.ts`が絶対パスの場合、`/Users/sa2taka/Documents/project`が該当します（そうとは限りませんが）。

1. 現在開いているファイルパスを取得して、下記を確認してテストかどうかを確認する。
   - ファイル名の末尾に`テストファイル名のサフィックス`がついていたらテスト
   - `テストのルートリスト`のどれかのディレクトリ以下であればテスト
   - それ以外はコード
2. コードだったら、下記の順にパスを生成して、存在したらそこに移動する。
   1. 同じディレクトリの中に`テストファイル名のサフィックス`を付けたファイルがあればそこに移動
      - 例：`src/models/users.ts` => `src/models/users.test.ts`
   2. ファイルパスからプロジェクトパスと`実装ファイルのルート`を削除して、プロジェクトパスと`テストのルートリスト`を先頭にくっつけて存在したらそこに移動（`テストのルートリスト`の先頭から探していく）。
      - 例：`src/models/users.ts` => `__tests__/models/users.test.ts`
      - または：`src/models/users.ts` => `__tests__/models/users.ts`
3. テストだったら下記の順にパスを生成して、存在したらそこに移動する。
   1. ファイルパスからプロジェクトパスと`テストのルートリスト`のうち該当するものを削除して、プロジェクトパスと`テストのルートリスト`を先頭にくっつけて存在したらそこに移動。続いてプロジェクトパスのみを先頭にくっつけて存在したらそこに移動
      - 例：`__tests__/models/users.test.ts` => `src/models/users.test.ts`
      - または：`__tests__/models/users.test.ts` => `models/users.test.ts`
   2. 同じディレクトリの中に`テストファイル名のサフィックス`を除いたファイルがあればそこに移動
      - 例：`src/models/users.test.ts` => `src/models/users.ts`

割とサクサク動くので、ぜひ皆様のJavaScript/TypeScript生活のお供に利用していただければと思います。
動かなかったら、すみません。

# 拡張を作る

VSCodeの拡張を作るのは、少なくともESLintのルールを作るよりは楽でした。
[公式で作り方が記載されているので](https://code.visualstudio.com/api/get-started/your-first-extension)、そのとおりに作れば全然問題ありません。リファレンスも記載があるので、別の拡張を作る際もお世話になることでしょう。

拡張のロジックを作り込む様子を記載しても本質を追いきれないので、今回は**選択しているテキストをキャメルケースにする**という拡張を作ってみましょう。ちなみに、これは[change-case](https://marketplace.visualstudio.com/items?itemName=wmaurer.change-case)という拡張で提供されているので、わざわざ公開することはしません。

下記`yarn`を利用していますが、`npm`でも問題ありません。

## 雛形づくり

まずは必要なJavaScriptのライブラリをインストールします。

```bash
$ yarn global add yo generator-code
```

ちなみに`yo`は[yeoman](https://yeoman.io/)のことで、プロジェクト雛形生成ツールのことです。JSのライブラリですが、普通にJavaとかのジェネレーターもあります。`generetor-hoge`というライブラリをインストールすることで`yo hoge`というコマンドを呼び出すことができ、雛形を生成できるということです。今回はhogeの部分が`code`ということです。

雛形を生成する際にいくつか質問を答える必要がありますが、どんな拡張を作るか、名前、説明等を入力します。

```bash
$ yo code
? What type of extension do you want to create? (Use arrow keys): Next Extension (TypeScript)
# 選択肢
❯ New Extension (TypeScript)
  New Extension (JavaScript)
  New Color Theme
  New Language Support
  New Code Snippets
  New Keymap
  New Extension Pack
  New Language Pack (Localization)
  New Web Extension (TypeScript)
  New Notebook Renderer (TypeScript)
? What's the name of your extension? To Camel Case
? What's the identifier of your extension? to-camel-case
? What's the description of your extension? Even if I die, I will convert to a CamelCase.
? Initialize a git repository? Yes
? Bundle the source code with webpack? Yes
? Which package manager to use? yarn # npmとどちらかが選べます
```

作成されたフォルダは下記のような構造となっています。

```bash
$ tree -L 2 -I node_modules
ts-camel-case
├── CHANGELOG.md
├── README.md
├── package.json
├── src
│   ├── extension.ts
│   └── test
├── tsconfig.json
├── vsc-extension-quickstart.md
├── webpack.config.js
└── yarn.lock
```

## 拡張づくり

雛形を作成した段階で、基本的には我々はロジックを作り込むだけの状態となっています。面倒な作業はすべてyeoman（とgenerator-code）がやってくれるて我々は作ることに集中できるのは素敵ですね。

VSCodeは`extension.ts`（正確には`dist/extension.ts`）の`activate`関数と`deactivate`関数を読み込みます。それぞれ拡張機能がアクティブになったとき、非アクティブになったとき（基本はVSCodeが開いた・閉じたあたりのタイミングと思われます）に実行されます。

デフォルトの`src/extension.ts`からコメントを除いたものが下記となります。

```typescript:src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  console.log('Congratulations, your extension "to-camel-case" is now active!');

  let disposable = vscode.commands.registerCommand('to-camel-case.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from To Camel Case!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
```

なんとなく、コードがら動作を読めるじゃないでしょうか。
ここで`F5`、または実行とデバッグで`Run Extension`を実行するとVSCodeが開きます。あとは`Cmd+Shift+P`で`Hello World`とうつと実行できます。（下記GifはWindowsなので`Ctrl+Shift+P`です）

![Hello World!](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Hello%20World.gif)

まぁ、だいたい予想通りの動きをしたと思います。が、気になる人は気になる部分で、`Hello World`と打ったら、なんで右下に表示されたんでしょうか。
上記のコードを見ると、

```typescript:src/extension.ts:L8
vscode.window.showInformationMessage('Hello World from To Camel Case!');
```

が表示を行う部分というのはわかりますが、`Hello World`と打ったら実行します、とはコードに書いてませんよね。

実は、`package.json`に記載があります。

### 設定

`package.json`に大体の設定を入れます。設定は名前や、設定可能なコンフィグ、どういったイベントがあるのか、そのイベントを呼び出すためにはどうすればいいか（ショートカットなど）などを記載できます。すべての設定項目は[Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)に記載があります。（Require:: Yなやつが存在してなくても問題ありませんが、気にしてはいけないのかもしれません）

package.jsonから、設定っぽいものを抜き出してみましょう。

```json:package.json
  "activationEvents": [
    "onCommand:to-camel-case.helloWorld"
  ],
  "contributes": {
    "commands": [
      {
        "command": "to-camel-case.helloWorld",
        "title": "Hello World"
      }
    ]
  },
```

まず、`activationEvents`ですが、これは簡単に言えば`特定のイベントが起きたときはどんなことを起こすか`というか感じのことを記載します。。例えば上記は、`onCommand`、つまりコマンドが打たれた場合です。それ以外にも特定の言語のファイルが開かれたとき、特定のファイルがワークスペースに存在した場合、などなど。一覧は[Activation Events](https://code.visualstudio.com/api/references/activation-events)に記載されています。

`contributes`は更に詳しく`activationEvents`を記載したもの、みたいなイメージでしょう（activationEventsいらない気がするけど）。今回の場合は`commands`の中に`to-camel-case.helloWorld`という`command`があり、その`title`が`Hello World`だったということですね。

更に、`src/extension.ts`を見ると、

```typescript:src/extension:L7~L9
let disposable = vscode.commands.registerCommand('to-camel-case.helloWorld', () => {
  vscode.window.showInformationMessage('Hello World from To Camel Case!');
});
```

これは`to-camel-case.helloWorld`というコマンドと、右下に通知を表示するという動作を登録する、という感じの動きです。
上記の設定と組み合わせて考えると、`Hello World`というタイトルのコマンドを実行することで、内部では`to-camel-case.helloWorld`というコマンドを実行し、その動作が、右下に`Hello World from To Camel Case!`と通知することだった、という感じですね。

察しのいい皆さまならここまで記載する必要もなかったかもしれません。

### 処理作成

では続いて処理を作っていきましょう。

今回作成するのは、選択されたテキストをキャメルケースに変換する、という処理でしたね。複雑な処理なら色々やらなければならないですが、これぐらいの処理なら簡単そうですね。
おそらく下記が必要となるでしょう。

- 選択されたテキストを取得する機能
- 選択されたテキストを置き換える機能
- （もちろん）キャメルケースに変換する処理

こんなかで一番面倒くさいのはキャメルケースに変換する処理です。

では早速完成品を見てみましょう。

```typescript:src/extension.ts
import * as vscode from "vscode";

function toCamel(str: string, upper = false) {
  const units = str.split(/[-_ ]+/);

  return units.reduce((acc, unit, index) => {
    if (index === 0 && !upper) {
      return unit.toLowerCase();
    }
    return acc + unit.toLowerCase().replace(/^[a-z]/, (s) => s.toUpperCase());
  }, "");
}

function changeSelectedToCamel() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { document, selections } = editor;

  editor.edit((editBuilder) => {
    selections.forEach((selection) => {
      const range = new vscode.Range(selection.start, selection.end);

      const text = document.getText(range);
      const replacement = toCamel(text);

      if (text === replacement) {
        return;
      }

      editBuilder.replace(range, replacement);
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "to-camel-case.toCamel",
    changeSelectedToCamel
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

```

まずは元々あった`actibate`関数を見てみましょう。

```typescript:src/extension.ts
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "to-camel-case.toCamel",
    changeSelectedToCamel
  );

  context.subscriptions.push(disposable);
}

```

といっても、これは`toCamel`というコマンドが呼ばれたら`changeSelectedToCamel`関数を呼ぶというだけですね。
では`changeSelectedToCamel`を見てみましょう。

```typescript:src/extension.ts
function changeSelectedToCamel() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { document, selections } = editor;

  editor.edit((editBuilder) => {
    selections.forEach((selection) => {
      const range = new vscode.Range(selection.start, selection.end);

      const text = document.getText(range);
      const replacement = toCamel(text);

      if (text === replacement) {
        return;
      }

      editBuilder.replace(range, replacement);
    });
  });
}

```

正直コメントで補足するまでもなく、コードを読めば単純に理解できるコートではありますね。

- 最初にactiveTextEditorを取得します。これは現在開いている、正確にはアクティブなエディタを取得します。
- エディタは現在の選択しているすべてが取得できる（`selections`）ので、取得します。
- それら一つひとつに対して下記を行います。
  - 選択範囲を取得します。
  - 選択範囲のテキストを取得します。
  - キャメルケースに変換します。
  - 選択範囲をキャメルケースに変換したもので変換します。

言葉にすればその通りですが、ソースコード上でもその通りとなっていることがわかるでしょうか？

実際に動かしてみましょう。複数選択していても動作するので、せっかくなら動作させてみました。

![My To Camelの動作](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/My%20To%20Camel.gif)

`vscode.window`がどうたらこうたらとか、`editor`ってこれ以外にどんなことができるの？というのは[VS Code API](https://code.visualstudio.com/api/references/vscode-api)に記載されていますので、別のこともやる場合は参考になります。

## 公開

今回、上記のExtensionは公開しませんが、方法は記載します。
といっても、[Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)の通りなのですが。

公開自体は簡単なのですが、そのためにはMicrosoftのアカウントが必要です。
[Azure DevOps](https://dev.azure.com/)にてOrganizationを作る必要があるのですが、そのタイミングで利用します。

Organizationを作成したなら、下記画像の通りPersonal Access Token生成ページへ移動します。

![Microsoft Personal Access Token生成ページへ](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Microsoft%20Peronal%20Access%20Token.png)

ページへ遷移したら`+ New Token`よりトークンを生成します。**このとき`Scopes`を`Custom Defined`として、`Market Place`の`Manage`にチェックを付けましょう**。

続いて[vsce](https://github.com/microsoft/vscode-vsce)をインストールします。

```bash
$ yarn global add vsce
```

vsceをインストールしたら、まずログインします。

```bash
$ vsce login <publisher name>
```

このとき、先程作成したアクセストークンが必要となります。

あとは下記コマンドで公開できます。

```bash
$ vsce package
$ vsce publish
```

他にもvsceには色々機能がありますが、ここでは割愛。

# 最後に

割と便利なので、僕の作ったやつ使ってみてください。もしくは、より便利なものがあったら教えて下さい。
