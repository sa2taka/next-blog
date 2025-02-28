import fetchSync from 'sync-fetch';
import MarkdownIt from 'markdown-it';
import { escapeHtml } from '@blog/libs/escapeHtml';
import prism from '@blog/libs/prism';

const fetchPermalink = (
  permalink: string
): {
  lines: string[];
  language: string;
  path: string;
  owner: string;
  repo: string;
} => {
  const response = fetchSync(permalink, {
    headers: {
      Accept: 'application/json',
    },
  });
  const data = response.json();

  const { payload } = data;
  return {
    lines: payload.blob.rawLines,
    language: payload.blob.language,
    path: payload.path,
    owner: payload.repo.ownerLogin,
    repo: payload.repo.name,
  };
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

  return {
    start: Number(m[1]),
    end: m[2] ? Number(m[2]) : Number(m[1]),
  };
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

    const { lines, language, owner, repo, path } = fetchPermalink(url);
    const lineRange = getLineRange(url);
    const { start, end } = lineRange ?? {
      start: 1,
      end: lines.length,
    };
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
