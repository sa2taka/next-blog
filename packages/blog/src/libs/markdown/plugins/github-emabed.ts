import fetchSync from 'sync-fetch';
import MarkdownIt from 'markdown-it';
import { escapeHtml } from '@blog/libs/escapeHtml';
import prism from '@blog/libs/prism';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// fetchSyncの同時実行数を制限するための設定
const FETCH_SYNC_INTERVAL = 100; // ミリ秒
const FETCH_SYNC_MAX_RETRIES = 100; // 最大リトライ回数
const MAX_CONCURRENT_FETCHES = 1; // 同時に実行可能なfetchSyncの最大数

// 現在実行中のfetchSyncの数
let currentFetchCount = 0;

// キャッシュディレクトリのパス
const CACHE_DIR = path.resolve(
  __dirname,
  '../../../../../../_data/_caches/github'
);

const generateHashFromUrl = (url: string): string => {
  return crypto.createHash('sha256').update(url).digest('hex');
};

const getCacheFilePath = (url: string): string => {
  const hash = generateHashFromUrl(url);
  return path.join(CACHE_DIR, `${hash}.json`);
};

const cacheExists = (url: string): boolean => {
  const cacheFilePath = getCacheFilePath(url);
  return fs.existsSync(cacheFilePath);
};

// キャッシュに保存するデータの型定義
type GitHubEmbedCache = {
  lines: string[];
  language: string;
  path: string;
  owner: string;
  repo: string;
};

type ParsedGitHubBlobUrl = {
  owner: string;
  repo: string;
  ref: string;
  path: string;
};

const readFromCache = (url: string): GitHubEmbedCache | null => {
  try {
    const cacheFilePath = getCacheFilePath(url);
    const cacheData = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(cacheData) as GitHubEmbedCache;
  } catch (error) {
    console.error(`[GitHub Embed] Failed to read from cache: ${error}`);
    return null;
  }
};

const writeToCache = (url: string, data: GitHubEmbedCache): boolean => {
  try {
    const cacheFilePath = getCacheFilePath(url);
    fs.mkdirSync(path.dirname(cacheFilePath), { recursive: true });
    fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`[GitHub Embed] Failed to write to cache: ${error}`);
    return false;
  }
};

const acquireFetchPermission = (): boolean => {
  if (currentFetchCount < MAX_CONCURRENT_FETCHES) {
    currentFetchCount++;
    return true;
  }
  return false;
};

const releaseFetchPermission = (): void => {
  if (currentFetchCount > 0) {
    currentFetchCount--;
  }
};

const waitForFetchPermission = (): void => {
  let retries = 0;

  while (retries < FETCH_SYNC_MAX_RETRIES) {
    if (acquireFetchPermission()) {
      return;
    }

    const startTime = Date.now();
    while (Date.now() - startTime < FETCH_SYNC_INTERVAL) {
      // ビジーウェイト（同期的な待機）
    }

    retries++;
  }

  currentFetchCount++;
};

const parseGitHubBlobUrl = (permalink: string): ParsedGitHubBlobUrl => {
  const url = new URL(permalink);
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.length < 5 || segments[2] !== 'blob') {
    throw new Error(`Unsupported GitHub blob URL: ${permalink}`);
  }

  const [owner, repo, , ref, ...filePathSegments] = segments;

  if (filePathSegments.length === 0) {
    throw new Error(`GitHub blob URL does not contain a file path: ${permalink}`);
  }

  return {
    owner,
    repo,
    ref,
    path: filePathSegments.join('/'),
  };
};

const detectLanguageFromFilePath = (filePath: string): string => {
  const extension = path.extname(filePath).slice(1).toLowerCase();

  const languageByExtension: Record<string, string> = {
    cjs: 'javascript',
    cs: 'csharp',
    html: 'markup',
    java: 'java',
    js: 'javascript',
    json: 'json',
    jsx: 'jsx',
    kt: 'kotlin',
    kts: 'kotlin',
    md: 'markdown',
    mjs: 'javascript',
    mts: 'typescript',
    rb: 'ruby',
    regex: 'regex',
    scala: 'scala',
    scss: 'scss',
    sh: 'bash',
    sql: 'sql',
    svg: 'markup',
    ts: 'typescript',
    tsx: 'tsx',
    xml: 'xml-doc',
    yml: 'yaml',
    yaml: 'yaml',
  };

  return languageByExtension[extension] ?? extension;
};

const fetchPermalink = (permalink: string): GitHubEmbedCache => {
  if (cacheExists(permalink)) {
    const cachedData = readFromCache(permalink);

    if (!cachedData) {
      throw new Error('Invalid cache data');
    }

    return cachedData;
  }

  let hasFetchPermission = false;

  try {
    waitForFetchPermission();
    hasFetchPermission = true;

    if (cacheExists(permalink)) {
      const cachedData = readFromCache(permalink);
      if (cachedData) {
        return cachedData;
      }
    }

    const { owner, repo, ref, path: filePath } = parseGitHubBlobUrl(permalink);
    const rawFileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
    const response = fetchSync(rawFileUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch GitHub blob contents: ${response.status} ${response.statusText}`
      );
    }

    const fileContents = response.text();

    const result: GitHubEmbedCache = {
      lines: fileContents.split(/\r?\n/),
      language: detectLanguageFromFilePath(filePath),
      path: filePath,
      owner,
      repo,
    };

    writeToCache(permalink, result);

    return result;
  } finally {
    if (hasFetchPermission) {
      releaseFetchPermission();
    }
  }
};

const githubPermalinkRegexp = /^https:\/\/github.com\/[^/]+\/[^/]+\/blob\/.+/i;
const isGithubPermaLink = (url: string): boolean => {
  return githubPermalinkRegexp.test(url);
};

const getLineRange = (url: string): { start: number; end: number } | null => {
  const m = url.match(/#L(\d+)(?:C\d+)?(?:-L(\d+)(?:C\d+)?)?$/);
  if (!m) {
    return null;
  }

  return { start: Number(m[1]), end: m[2] ? Number(m[2]) : Number(m[1]) };
};

const generateGitHubCodeBlock = ({
  url,
  lang,
  lines,
  hasLineRange,
  start,
  end,
  owner,
  repo,
  path,
}: {
  url: string;
  lang: string;
  lines: string[];
  hasLineRange: boolean;
  start: number;
  end: number;
  owner: string;
  repo: string;
  path: string;
}) => {
  lang = lang.toLowerCase();

  let value: string;
  const code = lines.slice(start - 1, end).join('\n');

  if (prism.languages[lang]) {
    value = prism.highlight(code, prism.languages[lang], lang);
  } else {
    value = code;
    lang = '';
  }

  const filePath = `${owner}/${repo}/${path}`;

  const lineNumbers = Array.from({ length: end - start + 1 }, (_, i) => {
    return `<span>${start + i}</span>`;
  }).join('\n');

  return `<div class="github-code-block">
  <div class="header">
    <div class="github-logo-area"><img src="/github-mark-white.svg" alt="GitHubのMark" class="github-logo" /></div>
    <p class="link-area"><a href="${escapeHtml(url)}">${escapeHtml(filePath)}</a></p>
    <p class="details-area">${hasLineRange ? (start === end ? `Line ${start}` : `Lines ${start} to ${end}`) : ''}</p>
  </div>
  <div class="code-area">
    <div class="line-numbers"  onScroll='this.nextElementSibling.scrollTop=this.scrollTop'>${lineNumbers}</div>
    <code class="${lang !== '' ? `language-${lang}` : 'language-plaintext'}" onScroll='this.previousElementSibling.scrollTop=this.scrollTop'>${value}</code>
  </div>
</div>`;
};

const hasExpanded = (tokens: any[], idx: number): boolean => {
  const content = tokens[idx]?.content;
  return (
    isGithubPermaLink(content) &&
    // NOTE: 同一行にテキストが複数ある場合はデフォルトの展開しない
    tokens.filter((token) => token.type === 'text').length === 1
  );
};

export const githubPermaLinkEmbedPlugin = (md: MarkdownIt) => {
  const defaultTextRender =
    md.renderer.rules.text ||
    function (tokens, idx) {
      return escapeHtml(tokens[idx].content);
    };

  md.renderer.rules.text = (...[tokens, idx, options, env, self]) => {
    const url = tokens[idx].content;
    if (!hasExpanded(tokens, idx)) {
      return defaultTextRender(tokens, idx, options, env, self);
    }

    let data: GitHubEmbedCache;
    try {
      data = fetchPermalink(url);
    } catch (error) {
      console.error(`[GitHub Embed] Failed to expand permalink ${url}: ${error}`);
      return defaultTextRender(tokens, idx, options, env, self);
    }

    const { lines, language, owner, repo, path } = data;
    const lineRange = getLineRange(url);
    const { start, end } = lineRange ?? { start: 1, end: lines.length };
    return generateGitHubCodeBlock({
      url,
      lang: language,
      lines,
      hasLineRange: Boolean(lineRange),
      start,
      end,
      owner,
      repo,
      path,
    });
  };

  // NOTE: linkifyで付与されるリンクを無効化する
  const defaultLinkOpenRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  // @ts-ignore
  md.renderer.rules.link_open = (...[tokens, idx, options, env, self]) => {
    if (tokens[idx].markup !== 'linkify') {
      return defaultLinkCloseRender(tokens, idx, options, env, self);
    }

    if (hasExpanded(tokens, idx + 1)) {
      return '';
    }

    return defaultLinkOpenRender(tokens, idx, options, env, self);
  };

  const defaultLinkCloseRender =
    md.renderer.rules.link_close ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  // @ts-ignore
  md.renderer.rules.link_close = (...[tokens, idx, options, env, self]) => {
    if (tokens[idx].markup !== 'linkify') {
      return defaultLinkCloseRender(tokens, idx, options, env, self);
    }

    if (hasExpanded(tokens, idx - 1)) {
      return '';
    }

    return defaultLinkOpenRender(tokens, idx, options, env, self);
  };
};
