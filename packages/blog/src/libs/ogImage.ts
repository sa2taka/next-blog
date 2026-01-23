import { BASE_URL } from './const';

export const DEFAULT_OG_IMAGE = `${BASE_URL}/logo-for-facebook.png`;
export const DEFAULT_TWITTER_IMAGE = `${BASE_URL}/logo-for-twitter.png`;

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
    const filename = ogImage.replace('../_images/', '');
    return `${BASE_URL}/images/${filename}`;
  }

  if (ogImage.startsWith('/')) {
    return `${BASE_URL}${ogImage}`;
  }

  return `${BASE_URL}/images/${ogImage}`;
};
