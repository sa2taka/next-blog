---
layout:      til
title:       permissions.cloudがCloudのIAMの権限を見るのに便利
category:    Google Cloud
createdAt:   2024-11-26
updatedAt:   2024-11-26
---

[permissions.cloud](https://permissions.cloud)はクラウドの権限周りを確認できるサイトです。

[Cloud Runにおける権限変更](https://blog.g-gen.co.jp/entry/user-does-not-have-access-to-image)に合わせて、既存のIAMが問題ないかを確認するために利用しました。

現在のCloud Runのデプロイするサービスアカウントは`roles/artifactregistry.writer`を持っていましたが、このroleで問題ないか、`roles/artifactregistry.reader`を付与する必要があるかを確認したかったです。が、Google Cloudのドキュメント上にはroleの持つ権限が記載がなかったですが、上記サイトにて記載されていました。
[roles/artifactregistry.writer](https://gcp.permissions.cloud/predefinedroles/artifactregistry.writer)の権限を確認し、[roles/artifactregistry.reader](https://gcp.permissions.cloud/predefinedroles/artifactregistry.reader)の権限をすべて持っていることを確認しました。ドキュメントに記載されていない権限が出てくるの良いですね。

データセットの元は[iam-dataset](https://github.com/iann0036/iam-dataset)というリポジトリであり、中身を見ると[クローラー](https://github.com/iann0036/iam-dataset/tree/main/util)で収集しているっぽいです。その元データは[IAM permissions reference](https://cloud.google.com/iam/docs/permissions-reference)というデータでした。こんなページあったんですね。超重いので、[permissions.cloud](https://permissions.cloud)を活用していきたいと思います。
