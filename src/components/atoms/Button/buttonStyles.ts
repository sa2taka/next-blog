import { styled } from '@linaria/react';
import { css } from '@linaria/core';

export const baseStyle = css`
  border-radius: 4px;
  display: inline-flex;
  flex: 0 0 auto;
  font-weight: 500;
  justify-content: center;
  align-items: center;

  outline: 0;
  position: relative;
  text-decoration: none;
  transition-duration: 0.28s;
  transition-property: box-shadow, transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
  border-radius: 4px;
  height: 48px;
  border: none;

  .theme--dark &::before {
    background-color: white;
  }

  .theme--light &::before {
    background-color: black;
  }

  &:hover::before {
    opacity: 0.08;
  }

  &::before {
    border-radius: inherit;
    bottom: 0;
    color: inherit;
    content: '';
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  }

  a& {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const Content = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.5px;
`;

export const defaultStyle = css`
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);

  .theme--dark &,
  .theme--light & {
    background: white;
  }

  &:before {
    background-color: black;
    opacity: 0.08;
  }
`;

export const outlinedStyle = css`
  background: transparent;

  &:hover::before {
    opacity: 0.12;
  }

  .theme--dark & {
    border: thin solid white;

    & ${Content} {
      color: white;
    }
  }

  .theme--light & {
    border: thin solid black;

    & ${Content} {
      color: black;
    }
  }
`;

export const iconStyle = css`
  background: transparent;
  border-radius: 50%;
  height: 48px;
  width: 48px;

  & ${Content} {
    height: 36px;
    width: 36px;
  }

  .theme--dark & {
    & ${Content} {
      color: white;
    }
  }

  .theme--light & {
    & ${Content} {
      color: black;
    }
  }
`;

export const xSmallStyle = css`
  width: 24px;
  height: 24px;

  & ${Content} {
    font-size: 9px;
    height: 16px;
    width: 16px;
  }
`;

export const smallStyle = css`
  width: 32px;
  height: 32px;

  & ${Content} {
    font-size: 12px;
    height: 24px;
    width: 24px;
  }
`;

export const disabledStyle = css`
  a& {
    pointer-events: none;

    .theme--dark & {
      & ${Content} {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .theme--light & {
      & ${Content} {
        color: black;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }
`;
