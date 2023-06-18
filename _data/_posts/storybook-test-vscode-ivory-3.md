---
layout:      post
title:       StorybookとTestの設定と何かと便利なVSCodeのスニペットの設定[ivory開発日誌3日目]
author:      sa2taka
category:    ivory
tags:        Sotrybook,React,Jest,Enzyme,VSCode,ivory
public:      true
createdAt:   2020-06-06
updatedAt:   2020-06-07
latex:       undefined
description:
  ivory開発三日目にしてStorybookとTestの設定を行いました。便利なVSCodeのスニペットの設定もしました。  
---


ハローワールド。

引き続きivoryを作成していきます。

[2日目ではtailwind.cssを導入しました](https://blog.sa2taka.com/post/tailwind-css-react-ivory-2/)

本日はまだツール群の構築。storybookとjest、そしてvscodeのスニペットの設定です。

# Storybook

[Storybook](https://storybook.js.org/)はVueやReactなどで作った**コンポーネントをカタログ化**してくれるツール、というのが直感的な説明となります。

今まではお世話になることはなかったのですが、今回はUIコンポーネントを作らないので、コンポーネントの管理と見た目のテストを簡略化するためにStoryBookを導入しました。まぁ、本音では使ってみたかったツールだから使う、ぐらいの感覚ですが。

## 導入

[インストールページ](https://storybook.js.org/docs/guides/guide-react/)を参照してインストールしていきます。といっても、Automatic stupで何ら問題ないのでそれでやっていきます。

ただしページではnpm(npx)を利用していましたが、今回はyarnを利用しているので多少コマンドが異なります。

```bash
$ yarn add @storybook/cli -D
$ yarn sb init --type react
```

## TypeScript対応

次にTypeScript対応をしていきましょう。

[TypeScript対応](https://storybook.js.org/docs/configurations/typescript-config/)ページを参考にやっていきます。

```bash
$ yarn add -D @storybook/addon-info react-docgen-typescript-loader
```

次にstorybook用のwebpackを導入していきます。
`.storybook/main.js`にwebpackの設定を書いていきます。

```javascript:.storybook/main.js
module.exports = {
webpackFinal: async config => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: require.resolve('ts-loader'),
      },
      // Optional
      {
        loader: require.resolve('react-docgen-typescript-loader'),
      },
    ],
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
},
};
```

ただ、残念ながらこれでは**一切動きません**。もちろん`css-loader`とか入っていませんからね。

幸い、この中身は殆ど既存のwebpackと同じで問題ないですのでコピペして行きましょう。少し書き方は違いますが。


```javascript:.storybook/main.js
const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
  webpackFinal: async (config) => {
    console.log(config.resolve);
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('ts-loader'),
        },
        {
          loader: require.resolve('react-docgen-typescript-loader'),
        },
      ],
    });
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        { loader: 'css-loader', options: { importLoaders: 1 } },
        {
          loader: 'postcss-loader',
          options: {
            config: {
              path: './.storybook/postcss.config',
            },
          },
        },
      ],
      include: path.resolve(__dirname),
    });

    config.module.rules.push({
      test: /\.s[ca]ss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    });

    config.module.rules.push({
      test: /\.(jpeg|png|gif|svg)$/,
      loader: 'file-loader?name=[name].[ext]',
    });

    config.resolve.alias['@'] = path.resolve(__dirname, '../src');
    config.resolve.alias['public'] = path.resolve(__dirname, '../public');
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
};
```

僕の場合はこんな感じ。例えば`resolve`の`alias`が設定してあったり、`tailwind.css`用に`postcss-loader`が入っていたりしますが、このあたりは現行のwebpackを参考に記載してください。

## 試してみる

まずはStorybook用のコンポーネントを作りましょう。とりあえず使うかどうかわかりませんが、タイトルロゴ付きのヘッダーを作って行きます。

```typescript:LayoutHeader/index.tsx
import React from 'react';
import './index.scss';
import { TitleLogo } from '@/components/atoms/TitleLogo';

export function LayoutHeader() {
  return (
    <header className="LayoutHeader h-16">
      <div className="h-full .z-0 flex relative items-center">
        <TitleLogo />
      </div>
    </header>
  );
}
```

こんな感じかな。`LayoutHeader`クラスのcssの内容はこんな感じ。

```scss:LayoutHeader/index.scss
.LayoutHeader {
  contain: layout;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
}
```

実際にビルドして表示してみるとこんな感じ。

![electron header](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/electron%20header.png)

ではこれをStorybookへ登録していきましょう。

といってもすごく簡単。今回の場合は`*.stories.tsx`というファイル名であれば登録されるので、適当なところに`*.stories.tsx`ファイルを作って下記のような設定にしましょう。

```typescript:LayoutHeader/index.stories.tsx
import React from 'react';
import { LayoutHeader as Component } from './index';
export default {
  title: 'organisms',
};
export const LayoutHeader = () => <Component />;
```

後は下記コマンドでstorybookを起動します。

```bash
$ yarn storybook
```

## 実行、しかし...

しかし、実行してみると下記の用になります。

![before storybook header](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/before%20storybook%20header.png)

なんか色々突っ込みどころはありますが、これはおそらくtailwind.cssのcssが効いてない気がします。
これはtailwind.cssをimportできてないので発生します。

なので`.storybook/config.ts`に`tailwind.css`を読み込むような設定を入れます。ちなみにファイルの場所は前回の記事で設定しました。

```typescript:.storybook/config.ts
import '@/style/tailwind.css';
```

![after storybook header](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/after%20storybook%20header.png)
OKですね！

# Test

お次にテストです。今回は`jest`と`enzyme`の鉄板セット（?）を使ってテスト環境を構築していきます。

## 導入

[jestのwebpack用の設定](https://jestjs.io/ja/docs/webpack)ページを参考に作っていきます。

まず、`jest`と`enzyme`に必要なデータをゴリゴリ集めていきます。

```bash
$ yarn add -D babel-jest @babel/preset-env @babel/preset-react react-test-renderer  identity-obj-proxy @types/jest 
$ yarn add -D enzyme enzyme-adapter-react-16 enzyme-to-json jest-enzyme @types/enzyme-adapter-react-16 
```

次にルートフォルダに`jest.config.json`を作成し、下記のようにします。ただし、cssを使ってないとかファイルを使ってないとか、エイリアスを使ってないとかあると思うので下記通りにはならないかもしれません。

```json:jest.config.json
{
  "snapshotSerializers": ["enzyme-to-json/serializer"],
  "setupFilesAfterEnv": ["<rootDir>/src/plugins/setupJestTest.ts"],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|scss)$": "identity-obj-proxy",
    "^@/(.+?)$": "<rootDir>/src/$1",
    "^public/(.+?)$": "<rootDir>/public/$1"
  }
}
```

jestではファイルの取り扱いが面倒くさいです。なのでfile用のMockを作ります。mockの場所は上記の`<rootDir>/__mocks__/fileMock.js`で指定されていますので、ここに下記のような設定にしましょう。

```javascript:___mocks__/fileMock.js
module.exports = 'test-file-stub';
```

また、上記のjestの設定ファイルに`setupFilesAfterEnv`というパラメータが指定されてしますが、これは環境を作成した後（テストを実行する前）に実行されるファイルです。ここで大体全体で利用する設定できます。ちなみにこれはドキュメントに書いてないので、もしかしたら推奨されないやり方かも知れませんので悪しからず。

```typescript:src/plugins/setupJestTest.ts
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
```

## テスト実行

後はテスト用のファイルを作るだけです。さっき作った`LayoutHeader`に対して正常に表示されるのかどうかのテスト、後スナップショットテストをかましていきましょう。

```typescript:LayoutHeader/index.test.tsx
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import LayoutHeader from './layoutHeader';

describe('LayoutHeader', () => {
  test('is rendered', () => {
    const wrapper = shallow(<LayoutHeader />);
    expect(wrapper).toBeTruthy();
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
```

```bash
$ yarn test
yarn run v1.22.4
$ jest
 PASS  src/components/organisms/layoutHeader.test.tsx
  LayoutHeader
    √ is rendered (7 ms)

 › 1 snapshot written.
Snapshot Summary
 › 1 snapshot written from 1 test suite.

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   1 written, 1 total
Time:        1.866 s, estimated 2 s
Ran all test suites.
Done in 2.52s.
```

`yarn jest`でも同様の結果になります。今回は`package.json`の`scripts`に設定を入れ込んでいるので`yarn test`としていますが、ここの設定に関しては省略しています。


# VScodeのスニペット設定

今回は構築から少し外れて、お困りごとを解決するためのVSCodeのスニペット設定について記載します。

## Reactのファイル構造ルール

まず困りごとの前にReactのファイル構造のルールについて。

Reactではファイル構成が割と十人十色というか、あまり決まりきったルールがあるわけではないのですが、私の場合は`Component.tsx`を作ったら同じ階層に`Component.scss`、`Component.test.tsx`、`Component.stoires.tsx`を作成するようなルールにしています。

上記ルールの問題は、1つの階層にコンポーネント数 * 4のファイルが出来上がるのですごく見通しが悪くなります。

なので今回はフォルダをそれぞれ作って、その中に`index.tsx`、`index.scss`...を作るルールにしました。またその中でしか利用しない子コンポーネントは同じ階層に入れる用にもしています。

例えば、上記のLayoutHeaderは中にTitleLogoコンポーネントを利用しています。TitleLogoコンポーネントはおそらく色々なところで使われますが、今回はLayoutHeaderコンポーネント内でしか使われないと仮定します。
そうした場合、下記のようなフォルダ構成になります。

```
LayoutHeader/
|-index.scss
|-index.stories.tsx
|-index.test.tsx
|-index.tsx
|-TitleLogo.scss
|-TitleLogo.stories.tsx
|-TitleLogo.test.tsx
|-TitleLogo.tsx
```

## 困りごと

お話変わりまして、react、stories、test、それぞれVSCodeのスニペットを設定したいのです。というのも、それぞれ初期状態がだいたい一緒なので、いちいちコピペするよりはVSCodeのスニペット機能を利用したいです。

例えば、上記の`LayoutHeader/index.tsx`であればファイルが作られた状態で下記のようになっていてほしいものです。

```typescript:LayoutHeader/index.tsx
import React from 'react';
import './index.scss';

interface Props {}

export const LayoutHeader: React.FC<Props> = (props) => {
  return <div></div>;
}
```

上記のデフォルト状態が良いか悪いかはおいておいて、ここで重要なのは`export const LayoutHeader`の`LayoutHeader`の部分です。これはフォルダ名です。

しかしながら、`TitleLogo.tsx`も上記に沿った内容にしたい場合、`LayoutHeader`の部分を`TitleLogo`にする必要があります。が、これはファイル名です。

つまり、ファイル名が`index.tsx`である場合はフォルダ名を、それ以外の場合はファイル名から拡張子を抜いた名前を利用したいのです。

## VSCodeのスニペット機能

解決方法の前に、VSCodeのスニペットについて少し説明します。

VSCodeのスニペット機能は、特定の入力をすることで事前に設定した文を出力してくれる機能です。

百聞は一見に如かずというので、実際に動いているのを見ていただいたほうが早いと思います。

![ES7 React/Redux/GraphQL/React-Native snippetsの動作](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/ES7%20React%3ARedux%3AGraphQL%3AReact-Native%20snippets%E3%81%AE%E5%8B%95%E4%BD%9C.gif)

これは[ES7 React/Redux/GraphQL/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)のスニペットの1つである`rfc`を入力した際の動きです。この場合はReactのFunctional Componentを入力してくれるスニペットですね。

見ていただいたとおり関数名が`index`になっています。まぁdefault exportなので問題はないですが、VSCodeでの自動インポート機能が全く効かなくなるので、できるだけデフォルトエクスポートは避けています。
ちなみにこの`index`はファイル名から拡張子を抜いた名前です。

VSCodeのスニペットでは**様々な変数が利用できます**。例えば`$TM_FILENAME_BASE`はファイル名から拡張子を抜いた名前を提供してくれます。

また、`${変数名/from/to/g}`で**正規表現を利用した置換が可能**です。今回はこの正規表現を利用して置換します。

## 解決方法

上記をまとめると、今回はindex.tsxの場合はフォルダ名を、それ以外の場合はフォルダ名を取得する正規表現を作成することで解決できそうです。

なので、今回は下記のような正規表現を作成しました。

```regex
.*[\/\\]([^\/\\]+)[\/\\]index\.tsx$|.*[\/\\](.*?)(?:\.[^.]*)$
```

[Brainf*ck](http://www.kmonos.net/alang/etc/brainfuck.php)かな？

正規表現の可視化サイトを利用してわかりやすくしてみましょう。

今回利用したサイトは[Regexper](https://regexper.com/#.*%5B%5C%2F%5C%5C%5D%28%5B%5E%5C%2F%5C%5C%5D%2B%29%5B%5C%2F%5C%5C%5Dindex%5C.tsx%24%7C.*%5B%5C%2F%5C%5C%5D%28.*%3F%29%28%3F%3A%5C.%5B%5E.%5D*%29%24)です。

![Regexperの結果](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Regexper%E3%81%AE%E7%B5%90%E6%9E%9C.png)

まぁ簡単に行ってしまえば、末尾がindex.tsxであれば上に、そうでなければ下にマッチする正規表現です。

ここで、groupを見てみると、上のgroup#1はindex.tsxの手前の\か/以外の文字列の連続にマッチします。すなわちindex.tsxの親フォルダが取得できます。
下のgroup#2は拡張子より前のファイルの名前にマッチします。

VSCodeではグループを`$1`、`$2`という感じで利用できます。そして、group1がマッチしたとき$2はマッチしていないので空文字、逆も同様なので`$1$2`とやると欲しい物が得られます。

では今回はこんなスニペットを用意します。

```json
"React Functional Component": {
	"prefix": "reafunc",
	"body": [
		"import React from 'react';",
		"import './${2:$TM_FILENAME_BASE}.scss';",
		"",
		"interface Props {}",
		"",
		"export const ${1:${TM_FILEPATH/.*[\\/\\\\]([^\\/\\\\]+)[\\/\\\\]index\\.tsx$|.*[\\/\\\\](.*?)(?:\\.[^.]*)$/$1$2/}}: React.FC<Props> = (props) => {",
		"  return <div></div>;",
		"}",
		"",
	]
},
```

ちなみにバックスラッシュはエスケープのために2つ重ねないと行けないので大変なことになっています。

## やってみた

まずはindex.tsxで上記スニペットを実行した様子です。

![index.tsxでreafuncを実行した結果](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/index.tsx%E3%81%A7reafunc%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%97%E3%81%9F%E7%B5%90%E6%9E%9C.gif)

名前がLayoutHeaderになっていますね。

次に`LayoutHeader/TitleLogo.tsx`でreafuncを実行した結果です。

![TitleLogo.tsxでreafuncを実行した結果](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/TitleLogo.tsx%E3%81%A7reafunc%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%97%E3%81%9F%E7%B5%90%E6%9E%9C.gif)

今度は名前がTItleLogoになっています。良いね。

# まとめ

本日はStorybook、JestとEnzyme、そしてVSCodeのスニペットを設定しました。

VSCodeのスニペットは調べても似たような事象がほとんどがなかったので、詳細に解説して別記事にしようと考えています。もしかして、需要がないんでしょうか。

本日は以上です。
