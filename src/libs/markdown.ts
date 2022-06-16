import MarkdownIt from 'markdown-it';
// @ts-ignore
import footnote from 'markdown-it-footnote';
// @ts-ignore
import imsize from 'markdown-it-imsize';
// @ts-ignore
import katex from '@iktakahiro/markdown-it-katex';
// @ts-ignore
import markdownItContainer from 'markdown-it-container';

import { GrammarValue } from 'prismjs';
import prism from '@/libs/prism';

const myHeaderPlugin = (md: MarkdownIt) => {
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

const myInlineCodePlugin = (md: MarkdownIt) => {
  md.renderer.rules.code_inline = (...[tokens, idx]) => {
    const tag = tokens[idx].tag;
    const content = tokens[idx].content;
    return `<${tag} class="hljsspan">${content}</${tag}>`;
  };
};

const myCodePlugin = (md: MarkdownIt) => {
  // code_blockではなくfence ruleにてcodeは拾われるらしい
  // @ts-ignore
  md.renderer.rules.fence = (...[tokens, idx]) => {
    const info = tokens[idx].info;
    const code = tokens[idx].content;

    let lang = '';
    let filename = '';
    if (info) {
      [lang, filename] = info.split(':').map((s) => s.trim());
    } else {
      lang = 'plaintext';
    }

    (prism.languages.bash as Record<string, GrammarValue>).prompt = /^[$#] /m;

    let value: string;

    if (prism.languages[lang]) {
      value = prism.highlight(code, prism.languages[lang], lang);
    } else {
      value = code;
      // shellで使われるtoken($, #, (%))を選択させないように変更
      if (lang === 'plaintext' || lang === '' || lang.includes('sh')) {
        value = value.replace(
          /^([$#&]\s*)/gm,
          '<span class="token prompt">$1</span>'
        );
      }
      lang = '';
    }

    let fileElement = '';
    if (filename && filename !== '') {
      fileElement = `<div class="filename">${filename}</div>`;
    }
    return `${fileElement}<code class="${
      lang !== '' ? `language-${lang}` : ''
    } ${
      filename && filename !== '' ? 'padding-for-filename' : ''
    }">${value}</code>`;
  };
};

const myImgPlugin = (md: MarkdownIt) => {
  const defaultRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, _, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.image = (...[tokens, idx, options, env, self]) => {
    tokens[idx].attrPush(['loading', 'lazy']);
    return defaultRender(tokens, idx, options, env, self);
  };
};

const myWebpConvertPlugin = (md: MarkdownIt) => {
  const imgRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, _, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.image = (...[tokens, idx, options, env, self]) => {
    const src = tokens[idx].attrs?.filter((elm) => elm[0] === 'src')[0]?.[1];
    if (!src) {
      return imgRender(tokens, idx, options, env, self);
    }

    const m = src.match(/\/\/images\.ctfassets\.net/);
    if (!m) {
      return imgRender(tokens, idx, options, env, self);
    }

    const token = src.includes('?') ? '&' : '?';
    const webp = `${src}${token}fm=webp`;
    const imgTag = imgRender(tokens, idx, options, env, self);
    const webpTag = `<source srcset="${webp}" type="image/webp"/>`;
    return `<picture>${webpTag}${imgTag}</picture>`;
  };
};

const containerRender = {
  validate: (params: any) => {
    return params.trim().match(/^(.*)$/);
  },

  render: (tokens: any, idx: any) => {
    const m = tokens[idx].info.trim().match(/^(.*)$/);
    const escapeHtml = (str: string) => {
      if (typeof str !== 'string') {
        return str;
      }
      return str.replace(
        /[&'`"<>]/g,
        (match) =>
          // @ts-ignore
          ({
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
          }[match] || '')
      );
    };

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

export const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true,
  langPrefix: '',
})
  .use(katex, { throwOnError: false, errorColor: ' #cc0000' })
  .use(myCodePlugin)
  .use(footnote)
  .use(imsize, { autofill: true })
  .use(myHeaderPlugin)
  .use(myInlineCodePlugin)
  .use(myWebpConvertPlugin)
  .use(myImgPlugin)
  .use(markdownItContainer, '', containerRender);
