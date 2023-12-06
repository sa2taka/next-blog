#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import * as glob from 'glob';

import { fileURLToPath } from 'url';
import { convertImage } from './libs/convert-image.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../../../_data/_images');
const destDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

const images = glob.sync(`${srcDir}/**/*.{gif,png,jpg}`);
let cnt = 0;

for (const imageSrc of images) {
  cnt++;
  console.log(`${imageSrc}(${cnt}/${images.length})`);
  const dest = imageSrc.replace(srcDir, destDir).normalize();
  const webpDest = dest.replace(/\.(gif|png|jpg)$/, '.webp');

  if (fs.existsSync(dest) && fs.existsSync(webpDest)) {
    continue;
  }
  const buffer = fs.readFileSync(imageSrc);
  const { minifyImage, webpImage } = await convertImage(buffer);

  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, minifyImage);
  }
  if (!fs.existsSync(webpDest)) {
    fs.writeFileSync(webpDest, webpImage);
  }
}

console.log('complete');
