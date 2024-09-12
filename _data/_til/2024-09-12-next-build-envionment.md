---
layout:      til
title:       Next.jsでビルド中かどうかを判定する（Next.jsのビルド時だけエラーになる処理に対する対応）
category:    Next.js
createdAt:   2024-09-12
updatedAt:   2024-09-12
---

`NEXT_PHASE` という環境変数を利用することで判定できます。または `NEXT_IS_EXPORT_WORKER` でも判定可能です。

# 背景

下記のような、`環境変数がなかったらエラーになる` 処理を書こうとします。

```typescript:config.ts
const fetchEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

export const OIDC_ISSUER = fetchEnv('OIDC_ISSUER');
```

この処理を、例えば `app/api/auth/login.ts` 等で下記のように記載するとします。

```typescript:app/api/auth/login.ts
import { OIDC_ISSUER } from "@/config";

const issuer = new Issuer({
  issuer: OIDC_ISSUER,
  // ...
});

export function GET() {
  // ...
}

export const dynamic = "force-dynamic";
```

動的なページであれば、実行環境の環境変数が利用されるのでビルド時には本来不要です。そのためDockerなどでビルドするときも環境変数は不要なはずです。
一方で上記の状態でビルドを行うと、Next.jsのビルド時に実際のコードが読み込まれ、`fetchEnv("OIDC_ISSUER")` が実行されます。

# 理由

理由としてはNext.jsのビルド、特にApp Routerを有効化している際には `export` という処理が走るからです。`export`は簡単に言えば静的なページを作成するための処理です。App Routerで常に実行されるのは、App Routerのデフォルトの挙動が静的なページを生成するためのものだからと想像しています。

静的なページを作成するためには当然対象のページのコードを読み込む必要があります。その際に上記のコードであれば `fetchEnv` 関数の実行まで始まってしまうため、環境変数がない場合はエラーになってしまいます。

対応方法としてはいくつか考えられそうです。

## `fetchEnv` をビルド時に実行しないようにする

例えば環境変数を定数ではなく関数にするとか。

```typescript:config.ts
const fetchEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません`);
  }
  return value;
}

export const getOidcIssuer = () => fetchEnv('OIDC_ISSUER');
```

Dynamic Importにするとか。

```typescript:app/api/auth/login.ts
export async function GET() {
  const { OIDC_ISSUER } = await import('@/config');
  const issuer = new Issuer({
    issuer: OIDC_ISSUER,
    // ...
  });
}

export const dynamic = "force-dynamic";
```

やりたいことに対して対応が大きすぎる気もする。`const lazy`が欲しいですね。

## ビルド時のみエラーにならないようにする

Next.jsでビルド中かどうかを判定するために環境変数が存在します。それが `NEXT_PHASE` です。

[NEXT_PHASEについて示唆されているDiscussion](https://github.com/vercel/next.js/discussions/48736)が一番詳細に記載されています。

[実際の定義には](https://github.com/vercel/next.js/blob/5e6b008b561caf2710ab7be63320a3d549474a5b/packages/next/shared/lib/constants.ts#L19-L23)下記の5つの値が存在します。上記で`export`時に実行されると記載されていますが、`NEXT_PHASE`は`phase-export` **ではなく** `phase-production-build` となっていることに**注意です**。

```typescript
export const PHASE_EXPORT = 'phase-export'
export const PHASE_PRODUCTION_BUILD = 'phase-production-build'
export const PHASE_PRODUCTION_SERVER = 'phase-production-server'
export const PHASE_DEVELOPMENT_SERVER = 'phase-development-server'
export const PHASE_TEST = 'phase-test'
```

また、それだとビルド中なのかExport中なのか判断がつかないため、`NEXT_IS_EXPORT_WORKER` という環境変数も存在します。[trueという値が入ります](https://github.com/vercel/next.js/blob/05578a13b49434582c9162053f08eb5dd3ea5a5c/packages/next/src/export/worker.ts#L14)。

下記のように環境変数を利用してビルド時のみエラーにならないようにできます。

```typescript:config.ts
import { PHASE_PRODUCTION_BUILD } from "next/dist/shared/lib/constants";

const fetchEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
      return "";
    }
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};
export const OIDC_ISSUER = fetchEnv('OIDC_ISSUER');
```

:::warning
当然静的なページが含まれている場合はビルド時の環境変数がそのまま静的なページに埋め込まれます。
ビルド時に必要なものに対してはビルド時に正しく環境変数を設定しましょう。
:::
