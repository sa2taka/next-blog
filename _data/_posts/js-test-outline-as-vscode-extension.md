---
layout:      post
title:       シンプルなJestのOutlineのVSCode拡張と作成の備忘録
author:      sa2taka
category:    typescript
tags:        VSCode,TypeScript,test
public:      true
createdAt:   2022-12-29
updatedAt:   2022-12-29
latex:       false
description:
  非常にシンプルなJestのoutlineのVSCode拡張を作成しました。シンプルですが、TreeItemのAPIやTypeScriptのコンパイラなどの理解が深まりました。その備忘録です。  
---

ハローワールド

VSCodeでテストを書く時、どんなdescribeがあるか、どんなtest(it)があるかをひと目で知りたいな、と思いました。

[Jestの拡張](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest)にも、テスト一覧を表示するExplorerの機能はありますが、デフォルトでTreeが開かないという理由だけで使っていません。

そのため今回はその拡張を作成しました。Tree Viewを利用した拡張の作成録も残しておきます。

# 完成品

https://marketplace.visualstudio.com/items?itemName=sa2taka.js-test-outline
コード: https://github.com/sa2taka/js-test-outline

![JS Test Outlineのプレビュー](https://images.ctfassets.net/xw0ljpdch9v4/4FvkMMbc4FXoiqCtMpxiXC/4c6327b258b198da7d45514e99ef1289/image.png)

JS Test OutlineはJavaScriptのTest(現状はJest)のアウトラインを表示するライブラリです。
Jestのように実行機能などはなく、本当にシンプルなアウトラインとなっています。

# TreeViewの実装方法

TreeViewというのは、名前の通り木構造を持ったもののViewです。今回のアウトラインやExplorerのようなものに利用されています。

実装方法は比較的簡単で、[TreeView API](https://code.visualstudio.com/api/extension-guides/tree-view)のページを参考にすれば簡単に完成します。

## TreeItemの実装

まずは、Treeに表示するItemを作成します。これはClassで表現されます。

```typescript:symbol-node.ts
export class SymbolNode extends TreeItem {
  name: string;
  description: string | undefined;

  children: Array<SymbolNode>;

  public command: Command = {
    command: 'js-test-outline.moveTo',
    arguments: [this],
    title: 'move',
  };

  public iconPath: ThemeIcon | undefined = undefined;

  constructor(tsNode: CallExpression, private config: OutlineProviderConfig, sourceFile: SourceFile) {
    // ...
    super(
      name,
      TreeItemCollapsibleState.Expanded,
    );
  }
}
```

TreeItemクラスを継承することでTreeViewのItemとして実装できます。必須なのは`name`です。

上記は今回利用しているTreeItemの実装のごく一部を抜き出したものです。TreeItemとして定義されている項目です。

まず `name` はTreeViewに表示される名前です。
`description`は `name` の右側に薄く表示されるものです。
`children` はその名の通り、項目の子供です。自分自身と同じ型の配列を取り、TreeView上で一つ下のインデントとして表現されます。
`iconPath`はTreeViewに表示するアイコンのパスです。指定しなければ何も表示されません。また今回は後術しますがVSCodeにデフォルトで存在するIconを利用するので`TreeItem`というクラスを利用します。
最後に`command`ですが、これはクリックしたときに発動するコマンドを表します。今回は、クリックしたテストの定義場所に遷移したいので、そのコマンドを記載してます。

## TreeDataProviderの実装

続いてTreeDataProviderを実装します。これはTreeViewを提供するもので、いくつかのメソッドを定義する必要があります。

```typescript:outline-provider.ts
export class OutlineProvider implements TreeDataProvider<SymbolNode> {
  getTreeItem(element: SymbolNode): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: SymbolNode | undefined): ProviderResult<SymbolNode[]> {
    if (element) {
      return element.children;
    }

    if (this.roots) {
      return this.roots;
    }

    return [];
  }
}
```

必須なのは `getTreeItem` と `getChildren` です。他にもいくつか定義されているメソッドはあります。

`getTreeItem` は表示の際に呼ばれるもので、基本的には受け取った `element` をそのまま返してあげれば良いです。

`getChildren` が重要で、これは子供を取得するものです。また、rootの状態、つまり一番最初に呼ばれるものでもあり、その場合は`element`が`undefined`となります。その時は何らかの`TreeItem`の配列を返す必要があります。今回は `this.roots` と、別の仕組みで取得した`SymbolNode`の配列を返しています。

## TreeViewの登録

`extension.ts`で下記のような実装を行うことで、上記で実装した仕組みを利用してTreeViewを表示することが出来ます

```typescript:extension.ts
export const activate = async (context: ExtensionContext) => {
  // ...
  const provider = new OutlineProvider(context, outlineProviderConfig);

  window.registerTreeDataProvider('js-test-outline-view', provider);
  // ...
};
```

この時、第一引数に`view`のIDを渡します。`view`はpackage.jsonで定義します。

```json:package.json
{
  // ...
  "contributes": {
    "views": {
      "test": [
        {
          "type": "tree",
          "id": "js-test-outline-view",
          "name": "JS Test Outline",
          "icon": "$(testing-show-as-list-icon)"
        }
      ]
    },
  },
}
```

viewsの説明は [VSCodeのAPI](https://code.visualstudio.com/api/references/contribution-points#contributes.views)に記載されているとおりです。上記の設定をした後 コマンドパレットから `Focus on <name> view` というコマンドを実行するとViewが表示されます。

## TreeViewを更新する

上記だけだと、一回表示したきりTreeViewは更新されません。今回で言えばファイルが編集されるたびにTreeViewは更新したいです。

[VSCodeに記載されている方法](https://code.visualstudio.com/api/extension-guides/tree-view#updating-tree-view-content)を参考にすれば好きなタイミングで更新できます。

```typescript:outline-provider.ts
export class OutlineProvider implements TreeDataProvider<SymbolNode> {
  context: ExtensionContext;
  roots: SymbolNode[] | undefined;

  constructor(context: ExtensionContext) {
    this.context = context;

    this.#initEventListeners();
  }

  // ...

  #initEventListeners() {
    // edit
    workspace.onDidChangeTextDocument(async (event) => {
      this.#buildView(window.activeTextEditor?.document || event.document);
      this.refresh();
    });
  }

  async #buildView(textDocument: TextDocument): Promise<void> {
    // ...
    this.roots = tree;
  }

  private _onDidChangeTreeData: EventEmitter<SymbolNode | undefined | null | void> = new EventEmitter<
    SymbolNode | undefined | null | void
  >();
  readonly onDidChangeTreeData: Event<SymbolNode | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

```

上記は編集が発生するたびに`buildView`でviewを生成するのと、`refresh`メソッドを実行する、という動作です。重要なのは下の4行です。これを実装することで`refresh`メソッドを実行するたびに表示を更新できます。

# テストの識別子を取得する

今回はファイルの中身を解析し、テストっぽい識別子があったらそれをTreeViewとして表示するというものです。

最初は `DocumentSymbol`を[取得するコマンド](https://code.visualstudio.com/api/references/commands#:~:text=vscode.executeDocumentSymbolProvider)を利用して、Symbolから引っ張ろうと思いました。が、これだと `it.todo`のような、関数callbackの無いものが取得できないため、利用は諦めました。

そのため今回は`typescirpt`のコンパイラを利用し、ASTから解析するようにしました。`eslint`とは異なり色々既存の仕組みが充実していて比較すると面白かったです。

## TypeScriptのコンパイラでASTを取得する

今回は下記のような実装をしています。

```typescript:compile.ts
import { createSourceFile, ScriptKind, ScriptTarget, SourceFile } from 'typescript';

export const compile = (code: string, config = { isReact: false, isJs: false }): SourceFile => {
  return createSourceFile('_.ts', code, ScriptTarget.ESNext, true, guessKind(config));
};

const guessKind = (config: { isReact: boolean; isJs: boolean }): ScriptKind => {
  if (config.isReact && config.isJs) {
    return ScriptKind.JSX;
  }

  if (!config.isReact && config.isJs) {
    return ScriptKind.JS;
  }

  if (config.isReact && !config.isJs) {
    return ScriptKind.TSX;
  }

  return ScriptKind.TS;
};
```

`typescript`内にある`createSourceFile`によりASTを取得することが出来ます。第一引数がファイル名、第二引数がコード本体、第三引数がターゲット、第四引数がASTに`parent`を付与するか(という意味合いだと思いますが、trueにしておかないと実行時エラーが発生する処理があるので、true推奨だと思われます)、第五引数がコードが何であるかを表します(今回はJS、TS、React対応を一応しています)。

TypeScriptのASTの結果は[TypeScript AST Viewer](https://ts-ast-viewer.com/#)で確認できます。

## ASTからテストっぽい識別子を抽出する

今回は下記のような関数を作成し対応しました。`visit`って名前で定義されていますが、本来他の処理を演る予定だったものを拡張して名前を変えるのを忘れた名残です。

```typescript:visit-test-node.ts
import { Node, isCallExpression, SourceFile } from 'typescript';
import { SymbolNode } from './symbol-node';
import { isGroup, isTest } from './symbol-type';

export type Config = {
  groupNames: string[];
  testNames: string[];
};

export const visitTestNode = (node: Node, config: Config, sourceFile: SourceFile): SymbolNode[] => {
  const childTestSymbols: SymbolNode[] = [];
  node.forEachChild((child) => {
    if (isCallExpression(child)) {
      const currentSymbolNode = new SymbolNode(child, config, sourceFile);

      if (
        !isGroup(currentSymbolNode.description ?? '', config.groupNames) &&
        !isTest(currentSymbolNode.description ?? '', config.testNames)
      ) {
        childTestSymbols.push(...visitTestNode(child, config, sourceFile));
        return;
      }

      const children = visitTestNode(child, config, sourceFile);
      currentSymbolNode.appendChild(...children);
      childTestSymbols.push(currentSymbolNode);
    } else {
      const result = visitTestNode(child, config, sourceFile);
      if (result.length > 0) {
        childTestSymbols.push(...result);
      }
    }
  });

  return childTestSymbols;
};
```

詳細な解説は省略しますが`isCallExpression`のようなものがTypeScript側に備わっていたり、nodeの子供は`forEachChild`で全部舐められたりと、APIが結構便利でした。

# ファイル内を移動する

今回、TreeViewをクリックしたら、対象が定義されている場所に遷移するような動作にしています。
クリックした場合に関しては上記に記載されているように、TreeItemの`command`を定義する必要があります。

今回はそのコマンドの処理側の記載を見ていきます。

```typescript:extension.ts
export const activate = async (context: ExtensionContext) => {
  // ...
  commands.registerCommand('js-test-outline.moveTo', (symbolNode: SymbolNode) => {
    const start = new Position(symbolNode.range.start.line, symbolNode.range.start.character);
    commands.executeCommand(
      'editor.action.goToLocations',
      window.activeTextEditor?.document.uri,
      start,
      [],
      'goto',
      ''
    );
  });
};
```

今回のコマンド、引数に`SymbolNode`を渡すので、上記の`registerComannd`の第二引数の関数の引数が`SymbolNode`となっています。

まずVSCodeで移動をするのにはbuilt-in commandの[goToLocations](https://code.visualstudio.com/api/references/commands#:~:text=editor.action.goToLocations)を利用します。

今回はシンプルに対象に遷移したかっただけなので、第三(コマンドの第二)引数の`start`に値を入れるだけです。

`start`は`Position`クラスであり、`Position`クラスは`line`と`character`、つまり何行目の何文字目かを表すものを指定します。

`Position`のコンストラクタの引数である`SymbolNode`の`range`の定義を見てみましょう。

```typescript:symbol-node.ts
  constructor(tsNode: CallExpression, private config: OutlineProviderConfig, sourceFile: SourceFile) {
   // ...
   this.range = {
      start: sourceFile.getLineAndCharacterOfPosition(tsNode.getStart()),
    };
  }
```

上記、いくつか罠があります。

まずはTypeScriptの`Node`に、何行目、何文字かを表すものはありません。`tsNode.start`に「先頭から何文字目」かを表す物があるだけです。
それを何行目、何文字目かに変換するのが`SourceFile#getLineAndCharacterOfPosition`です。

ただし、`tsNode.start`を引数に渡すと想定していない場所が返ってきます。というのも`tsNode.start`は空白や改行を含んだ場所を返します。
なので、そういった空白や改行を含んだものではなく、ちゃんと式(など)が始まる場所を取得する場合は`Node#getStart`を利用しましょう。
