import { css } from '@linaria/core';
/* Generated with http://k88hudson.github.io/syntax-highlighting-theme-generator/www */
/* http://k88hudson.github.io/react-markdocs */
/**
 * @author k88hudson
 *
 * Based on prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */
/*********************************************************
 * General
 */
export const prismTheme = css`
  pre[class*='language-'],
  code[class*='language-'] {
    color: #dddddd;
    font-size: 15px;
    text-shadow: none;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }
  pre[class*='language-']::selection,
  code[class*='language-']::selection,
  pre[class*='language-']::mozselection,
  code[class*='language-']::mozselection {
    text-shadow: none;
    background: #ce9178;
  }
  @media print {
    pre[class*='language-'],
    code[class*='language-'] {
      text-shadow: none;
    }
  }
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    background: #282c34;
  }
  :not(pre) > code[class*='language-'] {
    padding: 0.1em 0.3em;
    border-radius: 0.3em;
    color: #dddddd;
    background: #282c34;
  }
  /*********************************************************
* Tokens
*/
  .namespace {
    opacity: 0.7;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #93a1a1;
  }
  .token.punctuation {
    color: #999999;
  }
  .token.boolean {
    color: #56b6c2;
  }
  .token.property,
  .token.tag,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #d19a66;
  }

  .token.builtin {
    color: #e6c07b;
  }
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.inserted {
    color: #98c379;
  }
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #a67f59;
    background: #282c34;
  }
  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: #569cd6;
  }
  .token.function {
    color: #dcdcaa;
  }
  .token.regex,
  .token.important,
  .token.variable {
    color: #ee9900;
  }
  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }
  .token.entity {
    cursor: help;
  }
  .token.interpolation {
    color: #e06c75;
  }
  /*********************************************************
* Line highlighting
*/
  pre[data-line] {
    position: relative;
  }
  pre[class*='language-'] > code[class*='language-'] {
    position: relative;
    z-index: 1;
  }
  .line-highlight {
    position: absolute;
    left: 0;
    right: 0;
    padding: inherit 0;
    margin-top: 1em;
    background: #484c64;
    box-shadow: inset 5px 0 0 #686c74;
    z-index: 0;
    pointer-events: none;
    line-height: inherit;
    white-space: pre;
  }

  /*********
* regex
*/
  .token.language-regex {
    color: #ddd;
  }

  .language-regex .token.quantifier {
    color: #58f;
  }

  .language-regex .token.escape,
  .language-regex .token.special-escape {
    color: #c0c;
  }

  .language-regex .token.charclass,
  .language-regex .token.charset-punctuation {
    color: #d70;
  }

  .language-regex .token.anchor {
    color: #840;
  }

  .language-regex .token.group {
    color: #0a0;
  }

  .language-regex .token.backreference,
  .language-regex .token.alternation {
    color: #0a0;
  }

  .token.regex-delimiter,
  .token.regex-flags {
    color: #b7bcc0;
  }
`;
