import MarkdownIt from 'markdown-it';
// @ts-ignore
import footnote from 'markdown-it-footnote';
// @ts-ignore
import imsize from 'markdown-it-imsize';
// @ts-ignore
import katex from '@iktakahiro/markdown-it-katex';
// @ts-ignore
import markdownItContainer from 'markdown-it-container';
import { codePlugin, inlineCodePlugin } from './plugins/code';
import { headerPlugin } from './plugins/haeder';
import { imageSizeRenderPlugin, webpConvertPlugin } from './plugins/image';
import { containerRenderer } from './plugins/container';

export const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true,
  langPrefix: '',
})
  .use(katex, { throwOnError: false, errorColor: ' #cc0000' })
  .use(codePlugin)
  .use(inlineCodePlugin)
  .use(footnote)
  .use(imsize, { autofill: true })
  .use(headerPlugin)
  .use(webpConvertPlugin)
  .use(imageSizeRenderPlugin)
  .use(markdownItContainer, '', containerRenderer);
