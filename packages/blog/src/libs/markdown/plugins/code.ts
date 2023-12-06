import MarkdownIt from 'markdown-it';
import { GrammarValue } from 'prismjs';

import prism from '@blog/libs/prism';

export const codePlugin = (md: MarkdownIt) => {
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

export const inlineCodePlugin = (md: MarkdownIt) => {
  md.renderer.rules.code_inline = (...[tokens, idx]) => {
    const tag = tokens[idx].tag;
    const content = tokens[idx].content;
    return `<${tag} class="hljsspan">${content}</${tag}>`;
  };
};
