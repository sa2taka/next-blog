---
layout:      til
title:       brew upgrade後gcloudコマンドが動かなくなった
category:    gcloud, solve
createdAt:   2024-05-20
updatedAt:   2024-05-20
---

brew upgrade後、`gcloud` コマンドを叩くと下記のようなエラーが発生するようになった。

```
ERROR: gcloud failed to load. This usually indicates corruption in your gcloud installation or problems with your Python interpreter.

Please verify that the following is the path to a working Python 3.8-3.12 executable:
    /Users/sa2taka/.pyenv/versions/3.11.1/bin/python

If it is not, please set the CLOUDSDK_PYTHON environment variable to point to a working Python executable.

If you are still experiencing problems, please reinstall the Google Cloud CLI using the instructions here:
    https://cloud.google.com/sdk/docs/install


Traceback (most recent call last):
  File "/Users/sa2taka/libs/google-cloud-sdk/lib/gcloud.py", line 106, in gcloud_exception_handler
    yield
  File "/Users/sa2taka/libs/google-cloud-sdk/lib/gcloud.py", line 183, in main
    gcloud_main = _import_gcloud_main()
                  ^^^^^^^^^^^^^^^^^^^^^

...(中略)...

ImportError: dlopen(/Users/sa2taka/.pyenv/versions/3.11.1/lib/python3.11/lib-dynload/_ssl.cpython-311-darwin.so, 0x0002): Library not loaded: /usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib
  Referenced from: <...> /Users/sa2taka/.pyenv/versions/3.11.1/lib/python3.11/lib-dynload/_ssl.cpython-311-darwin.so
  Reason: tried: '/usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib' (no such file), '/usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib' (no such file), '/usr/local/lib/libssl.1.1.dylib' (no such file), '/usr/lib/libssl.1.1.dylib' (no such file, not in dyld cache)
```

エラーの上部にs解決策が色々出てるが、原因は `openssl@1.1` がないことだ。どうやら `brew upgrade` を叩いた際に消えたようだ。
とりあえず `openssl@1.1` をダウンロードすることで解決できる。

```
$ brew install openssl@1.1
```
