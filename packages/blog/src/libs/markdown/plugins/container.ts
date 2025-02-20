import { escapeHtml } from '@blog/libs/escapeHtml';

/**
 * コンテナ用のレンダリング用。
 * markdownItContainer のレンダリングのための関数
 */
export const containerRenderer = {
  validate: (params: any) => {
    return params.trim().match(/^(.*)$/);
  },

  render: (tokens: any, idx: any) => {
    const m = tokens[idx].info.trim().match(/^(.*)$/);

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M 11,4L 13,4L 13,15L 11,15L 11,4 Z M 13,18L 13,20L 11,20L 11,18L 13,18 Z"></path></svg>';

    if (tokens[idx].nesting === 1) {
      return `<div role="alert" class="message message__${escapeHtml(
        m[1]
      )}"><span aria-hidden="true" class="message__icon">${svg}</span><div class="alert__content">`;
    } else {
      return '</div></div>';
    }
  },
};
