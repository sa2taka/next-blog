import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminWebp from 'imagemin-webp';
import imageminGifsicle from 'imagemin-gifsicle';

export const convertImage = async (
  image: Buffer
): Promise<{ minifyImage: Buffer; webpImage: Buffer }> => {
  try {
    const minifyImage = await imagemin.buffer(image, {
      plugins: [
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
        imageminMozjpeg({
          quality: 60,
        }),
        imageminGifsicle(),
      ],
    });
    const webpImage = await imagemin.buffer(minifyImage, {
      plugins: [imageminWebp({ quality: 70 })],
    });
    return { minifyImage, webpImage };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
