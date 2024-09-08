import path from 'path';
import { generatePostFeed } from './libs/build-rss.mjs';
import { writeFileSync } from 'fs';

const destDir = path.join(import.meta.dirname, '../public/');

const rssFeed = await generatePostFeed();

writeFileSync(path.join(destDir, 'rss.xml'), rssFeed);
