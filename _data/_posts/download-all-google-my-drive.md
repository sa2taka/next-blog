---
layout:      post
title:       Google DriveのMy DriveのファイルをAPIを利用してダウンロードする
category:    programming
author:      sa2taka
tags:        typescript,node.js,googleapis
public:      false
createdAt:   2024-03-24
updatedAt:   2024-03-24
latex:       false
description:
   UI上でMy Driveの全ファイルをダウンロードできなかったので、APIを利用してダウンロードするようにした。
---

ひょんなことがあり、Google Drive上にあるMy Driveの全ファイルをダウンロードする必要がありました。  
昔はどうやらすべてzipにしてダウンロードする機能があったようですが、[現在のヘルプ](https://support.google.com/drive/answer/2423534?hl=ja&co=GENIE.Platform%3DDesktop)を見ると、ダウンロードするすべてのファイルを選択してダウンロードする必要があるようです。  
しかし、My Driveにあるファイルは20,000件を超えていて、画面からダウンロードするのはかなり手間だったので、Google Drive APIを利用してダウンロードすることとしました。

# 前準備

実行環境としてbunを利用して、TypeScriptにて記載します。APIの基本すべての言語で同じなので他の言語でも一定参考になるはずです。

Google Drive APIはGoogle CloudプロジェクトでAPIを有効にする必要があるためGoogle Cloudのプロジェクトを用意してください。
プロジェクトを用意したら[クイックスタート](https://developers.google.com/drive/api/quickstart/nodejs?hl=ja)を参照してAPIを叩けるようにします。

私の場合はclientId・clientSecret・refreshTokenを利用したものを利用しています。以降の処理は`getService`で`drive_v3.Drive`を取得できるようにします。ちなみにこの場合はクイックスタートとは異なり`google-auth-library`をインストールするようにします。

```typescript
import { type OAuth2Client } from "google-auth-library";
import { type drive_v3, google } from "googleapis";

interface OAuth2ParamItems {
	clientId: string | undefined;
	clientSecret: string | undefined;
	refreshToken: string | undefined;
}

const REDIRECT_URL = "http://localhost:3000";

// GoogleDriveへの操作を全て許可するscope
// URL: https://developers.google.com/drive/api/v3/about-auth
const SCOPES = ["https://www.googleapis.com/auth/drive"];

function getOAuth2Params(): OAuth2ParamItems {
	return {
		clientId: "myClientId",
		clientSecret: "myClientSecret",
		refreshToken: "myRefreshToken",
	};
}

function getGoogleApiOAuth2Client(): OAuth2Client {
	const authParams = getOAuth2Params();
	const oauth2Client = new google.auth.OAuth2(
		authParams.clientId,
		authParams.clientSecret,
		REDIRECT_URL,
	);
	return oauth2Client;
}

function getService(): drive_v3.Drive {
	const oauth2Client = getGoogleApiOAuth2Client();
	const authParams = getOAuth2Params();

	oauth2Client.setCredentials({
		refresh_token: authParams.refreshToken,
		scope: SCOPES.join(" "),
	});

	return google.drive({ version: "v3", auth: oauth2Client });
}
```

# My Driveのファイルを取得する関数

[ファイルやフォルダを検索する](https://developers.google.com/drive/api/guides/search-files?hl=ja#all)にてMy Driveの検索方法が記載あります。`list`APIを特に引数無しで叩くと取得できます。
ただし全て取得できないので、`nextPageToken`というプロパティを通して徐々にすべて取得するようにします。

```typescript
async function fetchAllMydDrive(nextPageToken?: string | undefined) {
	const service = getService();

	const res = await service.files.list({
		pageToken: nextPageToken,
	});
	if (!res.data.files) {
		return null;
	}

	return res;
}
```

# ダウンロードする関数

[blob ファイルの内容をダウンロードする](https://developers.google.com/drive/api/guides/manage-downloads?hl=ja#download-content) にてダウンロードする方法が記載あります。

注意点として、`File#data`はBlobなのですが、TypeScript的には`drive_v3.Schema$File`型なので型的には保存できないように見えます。

```typescript
async function downloadFile(realFileId: string) {
	const service = getService();

	const fileId = realFileId;
	const file = await service.files.get({
		fileId: fileId,
		alt: "media",
	});
	return file;
}
```

# すべてのMy Driveのファイルをローカルにダウンロードする

上記の関数を用意し、下記のスクリプトを実行するとexportsディレクトリ（ない場合はエラーになります）にファイルがどんどんダウンロードされていきます。
また注意点として**スプレッドシートやGoogleスライドはダウンロードできません**。[ExportAPI](https://developers.google.com/drive/api/guides/manage-downloads?hl=ja#export-content)を利用することでダウンロード可能になります。

```typescript
let nextPageToken: string | undefined = undefined;
while (true) {
	const res = await fetchAllMydDrive(nextPageToken);

	if (!res || !res.data.files) {
		break;
	}

	await Promise.all(
		res.data.files.map(async (file) => {
			if (!file.id) {
				return;
			}
			try {
				const downloaded = await downloadFile(file.id);
        // bunだとimport.meta.dirnameに実行ファイルのディレクトリが記載されている。
        // Node.jsだと`__dirname`を利用する。
				const savePath = path.join(import.meta.dirname, "exports", file.name);
        // file#dataがBlogだが型的には異なるので無理やり型変換している。
        // Node.jsの場合は `Buffer.from(await blob.arrayBuffer())` とするとBufferが取得できるので、
        // fs.writeFileSyncを利用して保存できると思います（確認はしていません）
				await Bun.write(savePath, downloaded.data as unknown as Blob);
			} catch {
        // フォルダやSpreadSheet・Docs・Slide等はダウンロードできない（エクスポートAPIを利用すると可能）。
        // file.mimeTypeにそういった情報があるため、あとから調査するのに使えるためログに残すと便利
				console.log("Failed to download file\t", file.name, "\t", file.mimeType);
			}
		}),
	);
	if (!res || !res.data.nextPageToken) {
		break;
	}
  // bunではsleepを利用することで待つことができる。
  // node.jsだとTimers Promises APIのsetTimeoutを利用すると代替ができる。
  // ただし、特に待つ必要はない（ダウンロードに時間がかかるので）
	await sleep(100);
	nextPageToken = res.data.nextPageToken;
  // 途中で失敗した時に再開するようにログに残している。基本不要。
	console.log("nextPageToken:\t", nextPageToken);
}
```
