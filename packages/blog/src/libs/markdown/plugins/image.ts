import MarkdownIt from 'markdown-it';
import fetchSync from 'sync-fetch';
import sizeOf from 'image-size';

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
    const src = tokens[idx].attrs?.filter((elm) => elm[0] === 'src')[0]?.[1];
    if (!src) {
      return imgRender(tokens, idx, options, env, self);
    }

    const m = src.match(
      /\/\/storage\.googleapis\.com\/sa2taka-next-blog\.appspot\.com/gi
    );
    if (!m) {
      return imgRender(tokens, idx, options, env, self);
    }

    const webp = src.replace(/\.[^.]+$/, '.webp');
    const imgTag = imgRender(tokens, idx, options, env, self);
    // NOTE: markdown-it-imsize fills img width and height.
    const width = imgTag.match(/width="(\d+)"/)?.[1];
    const height = imgTag.match(/height="(\d+)"/)?.[1];

    const webpTag =
      width && height
        ? `<source srcset="${webp}" type="image/webp" width="${width}" height="${height}"/>`
        : `<source srcset="${webp}" type="image/webp"/>`;
    return `<picture>${webpTag}${imgTag}</picture>`;
  };
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
    const img = fetchSync(imgSrc).arrayBuffer();
    const size = sizeOf(Buffer.from(img));

    size?.width && tokens[idx].attrPush(['width', size.width.toString()]);
    size?.height && tokens[idx].attrPush(['height', size.height.toString()]);
    size?.width && size.height && tokens[idx].attrPush(['loading', 'lazy']);
    return defaultRender(tokens, idx, options, env, self);
  };
};
