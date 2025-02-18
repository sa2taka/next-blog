import Head from 'next/head';
import React from 'react';
import styles from '@blog/styles/page-styles/guide.module.css';

const Guide = () => {
  return (
    <>
      <Head>
        <title>プライバシーポリシー・利用ガイドライン</title>
        <meta
          data-hid="description"
          name="description"
          content="プライバシーポリシー・利用ガイドライン"
        />
        <meta
          data-hid="og:title"
          name="og:title"
          content="プライバシーポリシー・利用ガイドライン"
        />
        <meta
          data-hid="og:description"
          name="og:description"
          content="プライバシーポリシー・利用ガイドライン"
        />
      </Head>
      <div className={styles.guideRoot}>
        <h1>当サイト利用について</h1>
        <p>
          本ページはサイト利用にあたって必要となる情報が記載されています。お決まりの文言が多いですが、ご一読をお願いいたします。
        </p>
        <table>
          <caption>更新履歴</caption>
          <thead>
            <tr>
              <th>更新日</th>
              <th>更新内容</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <time dateTime="2020-04-26">2020/4/26</time>
              </td>
              <td>初版策定</td>
            </tr>
            <tr>
              <td>
                <time dateTime="2021-04-21">2021/4/21</time>
              </td>
              <td>Cookieの利用方法からテーマの保存を削除</td>
            </tr>
            <tr>
              <td>
                <time dateTime="2022-06-17">2022/6/17</time>
              </td>
              <td>Mastodonユーザーアカウントが消えたため、文言から削除</td>
            </tr>
            <tr>
              <td>
                <time dateTime="2025-02-18">2025/02/18</time>
              </td>
              <td>Google Analyticsを利用しなくなったので、文言から削除</td>
            </tr>
          </tbody>
        </table>
        <h2>筆者について</h2>
        <p>
          当サイトの作者・管理者は「sa2taka」(別名：とっぷら。以下、筆者)です
        </p>
        <p>
          当サイト、または筆者自身への問い合わせは、下記Xへのリプライ、ダイレクトメッセージにて受け付けています。
        </p>
        <ul>
          <li>
            <a href="https://twitter.com/t0p_l1ght">筆者のXアカウント</a>
          </li>
        </ul>
        <h2>推奨環境</h2>
        当サイトでは以下のブラウザをご利用ください。
        <h4>PC</h4>
        <ul>
          <li>Google Chrome</li>
          <li>Firefox</li>
          <li>Safari(Mac)</li>
        </ul>
        <h4>スマホ</h4>
        <ul>
          <li>Google Chrome</li>
          <li>Safari</li>
        </ul>
        <h2>著作権</h2>
        <p>
          当サイトで掲載している文章・画像・動画等のあらゆる著作物(以下、コンテンツ)の著作権、その他権利は各権利所有者に帰属します。
        </p>
        <h2>無断転載の禁止</h2>
        <p>
          当サイトで掲載しているコンテンツを引用(著作権法第32条)の範囲を超えて無断転載することを禁止とします。引用時には、引用元ページもしくは当サイトのトップページへのリンクを貼ること、またはURLの明記を必須とします。
          <br />
        </p>
        <p>
          ただしサイト中に掲載したソースコードは、明示的にライセンスの記載があるもの、または著作権保有者が筆者以外の場合を除いて全てMITライセンスです。その場合は
          <a href="https://opensource.org/licenses/MIT">MITライセンス</a>(
          <a href="https://ja.osdn.net/projects/opensource/wiki/licenses%2FMIT_license">
            日本語訳
          </a>
          )の範囲内で利用・転載が可能です。
        </p>
        <h2>免責事項</h2>
        <p>
          当サイトのコンテンツ及び情報は必ずしも正確性を保証するものではありません。
        </p>
        <p>
          当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますので、ご了承ください。
          <br />
          また当サイトからリンクによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任も負いません。
        </p>
      </div>
    </>
  );
};

export default Guide;
