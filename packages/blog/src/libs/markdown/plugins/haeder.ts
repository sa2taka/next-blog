import MarkdownIt from 'markdown-it';

/**
 * headingタグのレベルを変更するプラグイン。
 *
 * Markdownにおける # は h1 として扱われるが、h1 は記事タイトル一つのみとしするため、
 * h2にレベルを変更する。同様にすべてのレベルを1つずつ下げる。
 */
export const headerPlugin = (md: MarkdownIt) => {
  md.renderer.rules.heading_open = (...[tokens, idx, options, _, self]) => {
    const tag = tokens[idx].tag;
    const content = tokens[idx + 1].content;
    const m = tag.match(/^h([123456])$/);
    if (m) {
      const headerIndex = Number(m[1]);
      const newIndex = headerIndex < 6 ? headerIndex + 1 : 6;
      return `<h${newIndex} id="${content}">`;
    } else {
      return self.renderToken(tokens, idx, options);
    }
  };

  md.renderer.rules.heading_close = (...[tokens, idx, options, _, self]) => {
    const tag = tokens[idx].tag;
    const m = tag.match(/^h([123456])$/);
    if (m) {
      const headerIndex = Number(m[1]);
      const newIndex = headerIndex < 6 ? headerIndex + 1 : 6;
      return `</h${newIndex}>`;
    } else {
      return self.renderToken(tokens, idx, options);
    }
  };
};
