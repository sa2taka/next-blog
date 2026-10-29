import { BASE_URL, BLOG_TITLE } from './const';

export const DEFAULT_OG_IMAGE = `${BASE_URL}/logo-for-facebook.png`;
export const DEFAULT_TWITTER_IMAGE = `${BASE_URL}/logo-for-twitter.png`;
export const DEFAULT_OG_IMAGE_ALT = `${BLOG_TITLE} の OGP 画像`;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_TYPE = 'image/png';
export const DEFAULT_OG_IMAGE_WIDTH = 1200;

// 公開ファイル名は build-public-image が NFC 正規化して書き出すため、同じ形に揃えてからエンコードする
const encodePath = (path: string): string => encodeURI(path.normalize());

/**
 * ogImageの値を絶対URLに変換する
 * - 外部URL (https://...) はそのまま返す
 * - ローカルパス (../_images/...) は公開URLに変換
 * - 未設定の場合はデフォルト画像を返す
 */
export const resolveOgImageUrl = (ogImage: string | undefined): string => {
  if (!ogImage) {
    return DEFAULT_OG_IMAGE;
  }

  if (ogImage.startsWith('http://') || ogImage.startsWith('https://')) {
    return ogImage;
  }

  if (ogImage.startsWith('../_images/')) {
    return `${BASE_URL}/images/${encodePath(ogImage.replace('../_images/', ''))}`;
  }

  if (ogImage.startsWith('/')) {
    return `${BASE_URL}${encodePath(ogImage)}`;
  }

  return `${BASE_URL}/images/${encodePath(ogImage)}`;
};
