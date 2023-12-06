#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import * as glob from 'glob';

import { fileURLToPath } from 'url';
import { convertImage } from './libs/convert-image.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postDir = path.join(__dirname, '../../../_data/_posts');
const imgDir = path.join(__dirname, '../../../_data/_images');

// Replace spaces with underscores in image paths within Markdown files
const mds = glob.sync(`${postDir}/**/*.md`);

mds.forEach((file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let updated = false;
    const updatedData = data.replace(
      /(\!\[.*?\]\()([^\)]+)(\))/g,
      (match, p1, p2, p3) => {
        const updatedPath = p2.replace(/ /g, '_');
        updated = true;
        return `${p1}${updatedPath}${p3}`;
      }
    );

    fs.writeFile(file, updatedData, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      if (updated) console.log(`Updated image paths in ${file}`);
    });
  });
});

// Replace spaces with underscores in file names within imgDir
const imgs = glob.sync(`${imgDir}/*`);

imgs.forEach((file) => {
  const updatedFileName = path.basename(file).replace(/ /g, '_');
  const updatedFilePath = path.join(path.dirname(file), updatedFileName);

  fs.rename(file, updatedFilePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Renamed file: ${file} to ${updatedFilePath}`);
  });
});
