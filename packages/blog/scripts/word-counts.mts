import code from 'markdown-it/lib/rules_block/code.mjs';
import { fetchAllPost, fetchAllTil } from '../src/libs/dataFetcher';
import { markdown } from '../src/libs/markdown';

const posts = await fetchAllPost();
const tils = await fetchAllTil();

type CountResult = {
  words: number;
  chars: number;
  sections: number;
  wordsPerSection: number;
  charsPerSection: number;
};

const segmenterJaWork = new Intl.Segmenter('ja', { granularity: 'word' });
const segmenterJaChar = new Intl.Segmenter('ja', { granularity: 'grapheme' });

const count = (text: string): CountResult => {
  const parsed = markdown.parse(text, {});

  let words = 0;
  let chars = 0;
  let sections = 1;
  let wordsListBySections: number[] = [0];
  let charsListBySections: number[] = [0];

  let countEnable = true;
  for (const token of parsed) {
    if (token.type === 'blockquote_open') {
      countEnable = false;
    }

    if (token.type === 'blockquote_close') {
      countEnable = true;
    }

    if (token.type === 'fence') {
      continue;
    }

    if (token.type === 'heading_open' && token.level === 0) {
      sections++;
      wordsListBySections.push(0);
      charsListBySections.push(0);
    }

    const contentWords = Array.from(
      segmenterJaWork.segment(token.content)
    ).length;
    const contentChars = Array.from(
      segmenterJaChar.segment(token.content)
    ).length;

    if (countEnable) {
      words += contentWords;
      chars += contentChars;
      wordsListBySections[sections - 1] += contentWords;
      charsListBySections[sections - 1] += contentChars;
    }
  }

  return {
    words,
    chars,
    sections,
    wordsPerSection: Math.round(
      wordsListBySections.reduce((a, b) => a + b, 0) / sections
    ),
    charsPerSection: Math.round(
      charsListBySections.reduce((a, b) => a + b, 0) / sections
    ),
  };
};

type Content = {
  body: string;
  title: string;
  createdAt: string;
  type: string;
  category: string;
};

const allItems = [
  ...posts.map((v) => ({ ...v, type: 'post', category: v.category.slug })),
  ...tils.map((v) => ({ ...v, type: 'til', category: v.category })),
].sort(
  (a: Content, b: Content) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
);

const tsvLines = allItems.map((item: Content) => {
  const { words, chars, sections, wordsPerSection, charsPerSection } = count(
    item.body
  );
  return `${item.title}\t${item.type}\t${item.category}\t${new Date(item.createdAt).toISOString()}\t${words}\t${chars}\t${sections}\t${wordsPerSection}\t${charsPerSection}`;
});

const tsvContent = `Created\tType\tCategory\tCreatedAtd\tWords\tChars\tSections\tWordsPerSection\tCharsPerSection\n${tsvLines.join('\n')}`;

console.log(tsvContent);
