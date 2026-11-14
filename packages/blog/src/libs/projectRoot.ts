import path from 'path';

/**
 * モノレポのルートと _data の場所。ビルドとスクリプトは packages/blog を cwd として実行される。
 */
export const PROJECT_ROOT = process
  .cwd()
  .replace(/[\\/]packages[\\/]blog([\\/].*)?$/, '');

export const DATA_ROOT = path.join(PROJECT_ROOT, '_data');
