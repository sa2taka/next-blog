/**
 * サイト内パスを末尾スラッシュ付きに揃える。出力は trailingSlash: 'always' のため。
 */
export const withTrailingSlash = (path: string): string =>
  path.endsWith('/') ? path : `${path}/`;
