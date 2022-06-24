import { css } from '@linaria/core';

export const postBodyStyle = css`
  line-height: 1.75;
  letter-spacing: 0.025em;
  margin-top: 32px;

  & * {
    word-wrap: break-word;
  }

  .padding-for-filename {
    padding-top: 2.6em !important;
  }

  .filename {
    color: #eee;
    display: inline-block;
    position: absolute;
    background-color: #444;
    word-break: break-all;
    border-radius: 0 0 5px 0;
    font-size: 0.9em;
    padding: 3px 6px;
  }

  .theme--dark & strong {
    /* color: white; */
    background: linear-gradient(transparent 80%, var(--secondary-color) 0%);
  }

  .theme--light & strong {
    /* color: black; */
    background: linear-gradient(transparent 80%, var(--secondary-color) 0%);
  }

  & blockquote {
    padding: 0.6em 1em;
    margin: 2em auto;
    border-left: 3px solid rgba(128, 128, 128, 0.8);
  }

  & p {
    margin-bottom: 1.8em;
  }

  & blockquote blockquote {
    padding: 0.4em 1em;
    margin: 1.2em auto 0.7em;
    border-left: 3px solid rgba(128, 128, 128, 0.8);
  }

  .theme--dark & blockquote {
    color: #aaa;
  }

  .theme--light & blockquote {
    color: #333;
  }

  & ul {
    margin-bottom: 1.8em;
  }

  /* 引用元名 */
  & blockquote p.author {
    text-align: right;
  }

  & blockquote p.author::before {
    content: '―― ';
  }

  /* 画像 */
  & picture,
  & img,
  & source[type='image/webp'] {
    display: block;
    max-width: min(100%, 640px);
    margin: 0.6em auto;
  }

  /* header */
  & h2 {
    font-size: 2em;
  }
  .theme--dark & h2,
  .theme--dark & h3 {
    border-bottom: 1px solid #222;
  }

  .theme--light & h2,
  .theme--light & h3 {
    border-bottom: 1px solid #eee;
  }

  & h2 {
    margin-top: 64px;
    margin-bottom: 24px;
  }

  & h3 {
    margin-top: 58px;
    margin-bottom: 18px;
  }

  & h4,
  & h5 {
    margin-top: 52px;
    margin-bottom: 20px;
  }

  & hr.footnotes-sep {
    margin-top: 12px;
    margin-bottom: 16px;
  }

  & code {
    margin: auto auto 1.5em;
    word-wrap: normal;
    white-space: pre;
    padding: 0.8em 0.6em;
  }

  & code .token.prompt {
    user-select: none;
    color: #777;
  }

  .theme--light & a {
    color: #006256;
  }

  /* HACK */
  code {
    display: block;
    overflow-x: auto;
    padding: 0.5em;
    color: #ddd;
    background: #282c34;
    margin: 0.5em 0;
    font-weight: 500;
  }

  & blockquote p {
    margin-bottom: 0px !important;
  }

  & code.hljsspan {
    display: inline;
    overflow-x: initial;
    overflow-wrap: break-word;
    color: #ddd;
    background: #282c34;
    padding: 0.1em 0.4em;
    margin-left: 4px;
    margin-right: 4px;
    white-space: normal;
  }

  #app.theme--light & code.hljsspan {
    color: #222;
    background: #e0e0e4;
  }

  code::before,
  code::after {
    content: none;
  }

  code .hljs-comment {
    color: #acb3c0;
  }

  & .message {
    padding: 1.2rem 0.8rem;
    margin: 1.5rem 0;
    border-left: 4px solid #2196f3;
    background: #f4f8fa;
    position: relative;
  }

  .theme--dark & .message {
    background: #161624;
  }

  & .message.message__success {
    background: #f4f8fa;
    border-left: 4px solid #4caf50;
  }

  .theme--dark & .message.message__success {
    background: #161624;
  }

  & .message.message__error {
    background: #fdf7f7;
    border-left: 4px solid #f44336;
  }

  .theme--dark & .message.message__error {
    background: #241616;
  }

  & .message.message__warning {
    background: #fcf8f2;
    border-left: 4px solid #ff9800;
  }

  .theme--dark & .message.message__warning {
    background: #201612dd;
  }

  & .message .message__icon {
    position: absolute;
    top: 1.2rem;
    left: -16px;
    width: 28px;
    height: 28px;
    padding: 4px;
    background-color: #2196f3;
    border-radius: 50% 50%;
  }

  & .message.message__success .message__icon {
    background-color: #4caf50;
  }

  & .message.message__error .message__icon {
    background-color: #f44336;
  }

  & .message.message__warning .message__icon {
    background-color: #ff9800;
  }

  & .message .message__icon svg {
    fill: white;
  }

  & .message .alert__content {
    margin-left: 1rem;
  }

  & .message .alert__content p:last-child {
    margin-bottom: 0;
  }

  & ul,
  & ol {
    margin-left: 1.2em;
  }
`;
