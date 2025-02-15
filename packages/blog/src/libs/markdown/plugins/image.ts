import { readFileSync } from 'fs';
import sizeOf from 'image-size';
import MarkdownIt from 'markdown-it';
import { join } from 'path';
import fetchSync from 'sync-fetch';

/**
 * 特定のルールの画像をwebpとともにpictureタグに変換するプラグイン。
 */
export const webpConvertPlugin = (md: MarkdownIt) => {
  const imgRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, _, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.image = (...[tokens, idx, options, env, self]) => {
    const origin = tokens[idx];
    const originSrc = tokens[idx].attrs?.filter(
      (elm) => elm[0] === 'src'
    )[0]?.[1];
    if (!originSrc) {
      return imgRender(tokens, idx, options, env, self);
    }

    const m = originSrc.match(/^\.\.\/_images\/.+$/gi);
    if (!m) {
      return imgRender(tokens, idx, options, env, self);
    }

    const imgSrc = originSrc.replace('../_images/', '/images/');
    const webpSrc = imgSrc.replace(/\.[^.]+$/, '.webp');
    origin.attrs &&
      (origin.attrs = origin.attrs
        ?.filter((elm) => elm[0] !== 'src')
        .concat([['src', imgSrc]]));
    const imgTag = imgRender(tokens, idx, options, env, self);
    // NOTE: markdown-it-imsize fills img width and height.
    const width = imgTag.match(/width="(\d+)"/)?.[1];
    const height = imgTag.match(/height="(\d+)"/)?.[1];

    const webpTag =
      width && height
        ? `<source srcset="${webpSrc}" type="image/webp" width="${width}" height="${height}"/>`
        : `<source srcset="${webpSrc}" type="image/webp"/>`;
    return `<picture>${webpTag}${imgTag}</picture>`;
  };
};

/**
 * srcがローカルなら _data/_imagesから、そうではない場合はfetchして、Bufferを取得する。
 * webpConvertPluginの後でuseすること。
 */
const fetchImageBuffer = (src: string): ArrayBuffer => {
  if (src.startsWith('../_images')) {
    const fileName = decodeURIComponent(
      src.replace('./images/', '').normalize()
    );
    const projectRoot = process
      .cwd()
      .replace(/(.+?)\/packages\/blog\/?.*$/, '$1');
    const path = join(projectRoot, '_data', '_images', fileName);
    const data = readFileSync(path);
    return data;
  } else {
    return fetchSync(src).arrayBuffer();
  }
};

/**
 * 画像系のタグにwidthとheightを追加するプラグイン。
 */
export const imageSizeRenderPlugin = (md: MarkdownIt) => {
  const defaultRender =
    md.renderer.rules.image ||
    function (tokens, idx, options, _, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.image = (...[tokens, idx, options, env, self]) => {
    const imgSrc = tokens[idx].attrGet('src') as string;
    const img = fetchImageBuffer(imgSrc);
    const size = sizeOf(Buffer.from(img));

    size?.width && tokens[idx].attrPush(['width', size.width.toString()]);
    size?.height && tokens[idx].attrPush(['height', size.height.toString()]);
    size?.width && size.height && tokens[idx].attrPush(['loading', 'lazy']);
    return defaultRender(tokens, idx, options, env, self);
  };
};
