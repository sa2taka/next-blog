---
layout:      post
title:       .NET Frameworkで画面のスクリーンショットを撮る
author:      sa2taka
category:    programming
tags:        C#,.NET Framework
public:      true
createdAt:   2020-08-21
updatedAt:   2020-08-21
latex:       undefined
description:
  .NET Frameworkを利用して、Windowsのスクリーンショットを撮るツールを作成したときの記録です。  
---

ハローワールド

インフラの作業、特にWindows Serverの設定作業をやっていると画面のハードコピーの需要は高いです。
Windowsでは標準でPrint Screenキー、最近だとWin + Shift + Sで画面のキャプチャが出来ます。
通常ではAlt + Print Screenで画面をクリップボードに保存し、Excelなどに貼り付ける方法をよく取っています(こんなところでもExcelさん...[^hardcopy-with-excel])。

[^hardcopy-with-excel]:Windowsの標準の画像アプリがあまり良くない出来なので、実際にはExcelに貼り付けたほうが割と便利だったりしますが...

PrintScreenキー、非常に押しづらいですよね。
僕は押しづらいです。
特にマウス片手に作業する場面も多いので、できれば右手でスクリーンショットを取れれば嬉しいですが、大体PrintScreenは右上に...。
なので今回は、最低限のハードコピー用ツールを作成しました。~~winshotでいいじゃん[^winshot]~~

[^winshot]: [winshot](http://www.woodybells.com/winshot.html)ですが、最終更新日が2007年(!)であり、Windows10だと環境によっては動かないらしいので、そろそろ引退気味なソフトウェアですね

# 作成物

上記の願いを叶えるため、サクッと(大体4時間ぐらい)作ったのが[**Avalo**](https://github.com/sa2taka/Avalo/releases)[^avalo]です。
ドキュメントから何から不足しているのでバージョンは0.1.0です。このブログをドキュメントとしてください。

[^avalo]: 命名の理由ですが画像キャプチャ→カメラ→Cannon→観音→Avalokiteśvara(サンスクリット語で観世音菩薩)→Avaloとなっています。別にカメラと言ったらCannon、という意味合いではないです

使い方は実行して「Ctrl-q」でアクティブウィンドウを、「Ctrl-Shift-Q」で画面全体をキャプチャしてくれます。片手でキャプチャしたいのですが、大体左手で利用するショートカットキーは割り振られていることが多いので、熟考(4秒)の結果「q」を利用する事となりました。将来的に好きなように変更できるといいですね。間違ってもCtrl-wに割り振ってはいけません。

また、保存場所などはある程度カスタマイズ可能です。正直.NETでのプログラムは殆ど経験がなく、特に見た目がどうしようもないです。CSSとHTMLが欲しいですね。

![Avaloの設定画面](https://storage.googleapis.com/sa2taka-next-blog.appspot.com/Avalo-Setting.png)

# スクリーンショットを撮る

本題です。
.NET Frameworkでスクリーンショットを撮る方法は下記サイトにまとまっています。今回はこちらを参考にしました(スクリーンショット以外も参考にしています)。

[【C#】Windows用のスクリーンショットアプリを作成してみた](https://qiita.com/nemutas/items/dda1737346baa809e6f3#%E3%81%99%E3%81%B9%E3%81%A6%E3%81%AE%E3%83%87%E3%82%A3%E3%82%B9%E3%83%97%E3%83%AC%E3%82%A4%E3%82%921%E6%9E%9A%E3%82%B9%E3%82%AF%E3%82%B7%E3%83%A7%E3%81%A8%E3%81%97%E3%81%A6%E6%92%AE%E3%82%8B)

[画面をキャプチャする](https://dobon.net/vb/dotnet/graphics/screencapture.html)

実際に記載してみても正直どうやっているのか不明ですが、user32.dll(ウィンドウとかの管理?)やgdi32.dll(描画とかの管理?)を利用しているようです。

実際に記載しているクラスがこちら[^csharp]。

[^csharp]:どうでもいいですが、C#のコード例にusingが記載されていない場合が殆どなんですが、あれはなんでなんでしょうか。そういう慣習なんでしょうか。


```csharp:Capture.cs
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace Avalo {
    class Capture {
        /// <summary>
        /// 画面全体の画像を取得する
        /// </summary>
        /// <returns>画面全体の画像</returns>
        public static Bitmap CaptureScreen() {
            int left = SystemInformation.VirtualScreen.Left;
            int top = SystemInformation.VirtualScreen.Top;
            int width = SystemInformation.VirtualScreen.Width;
            int hight = SystemInformation.VirtualScreen.Height;

            IntPtr disDC = GetDC(IntPtr.Zero);

            Bitmap bmp;
            Rectangle rect = new Rectangle(left, top, width, hight);
            bmp = new Bitmap(rect.Width, rect.Height, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(bmp)) {
                IntPtr hDC = g.GetHdc();
                BitBlt(hDC, 0, 0, bmp.Width, bmp.Height, disDC, left, top, SRCCOPY);
                g.ReleaseHdc(hDC);
            }

            return bmp;
        }

        /// <summary>
        /// アクティブなウィンドウの画像を取得する
        /// </summary>
        /// <returns>アクティブなウィンドウの画像</returns>
        public static Bitmap CaptureActiveWindow() {
            IntPtr hWnd = GetForegroundWindow();
            IntPtr disDC = GetDC(IntPtr.Zero);

            DwmGetWindowAttribute(
                hWnd,
                DWMWA_EXTENDED_FRAME_BOUNDS,
                out var bounds,
                Marshal.SizeOf(typeof(RECT)));

            Bitmap bmp = new Bitmap(bounds.right - bounds.left , bounds.bottom - bounds.top, PixelFormat.Format32bppArgb);

            using (var g = Graphics.FromImage(bmp)) {
                IntPtr hDC = g.GetHdc();
                BitBlt(hDC, 0, 0, bmp.Width , bmp.Height , disDC, bounds.left , bounds.top, SRCCOPY);
                g.ReleaseHdc(hDC);
            }

            return bmp;
        }

        private const int SRCCOPY = 13369376;
        private const int CAPTUREBLT = 1073741824;
        private const int DWMWA_EXTENDED_FRAME_BOUNDS = 9;

        [DllImport("user32.dll")]
        private static extern IntPtr GetDC(IntPtr hwnd);

        [DllImport("gdi32.dll")]
        private static extern int BitBlt(IntPtr hDestDC,
            int x,
            int y,
            int nWidth,
            int nHeight,
            IntPtr hSrcDC,
            int xSrc,
            int ySrc,
            int dwRop);

        [DllImport("user32.dll")]
        private static extern IntPtr ReleaseDC(IntPtr hwnd, IntPtr hdc);

        [StructLayout(LayoutKind.Sequential)]
        private struct RECT {
            public int left;
            public int top;
            public int right;
            public int bottom;
        }

        [DllImport("user32.dll")]
        private static extern IntPtr GetWindowDC(IntPtr hwnd);

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        private static extern int GetWindowRect(IntPtr hwnd,
            ref RECT lpRect);

        [DllImport("dwmapi.dll")]
        private static extern int DwmGetWindowAttribute(IntPtr hwnd, int dwAttribute, out RECT pvAttribute, int cbAttribute);
    }
}
```

上記のQiitaの記事のやり方ではchromeを始めとした一部のウィンドウのスクリーンショットが撮れません。今回はウィンドウを取得するのではなく、画面全体からウィンドウの部分だけ取得するやり方を取っています。そのため、アクティブウィンドウがちゃんと撮られるわけではなく、どちらかというと見た目通りに取得できます(前面が通知や固定化されているウィンドウで隠れているとその通り画像が撮られる)。

それ以外にも下記のようなことを行っています。
・通知領域のみの表示
・Windows10の通知の機能を利用して写真を取ったら通知が出るようにしている
詳細は[Githubのコード](https://github.com/sa2taka/Avalo)を確認してください。
