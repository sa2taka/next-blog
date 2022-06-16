import { css } from '@linaria/core';

export const sheet = css`
  box-shadow: 0 0 0 0 rgb(0 0 0 / 20%), 0 0 0 0 rgb(0 0 0 / 14%),
    0 0 0 0 rgb(0 0 0 / 12%);

  .theme--dark & {
    background-color: #272727;
    color: #fff;
  }

  .theme--light & {
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.87);
  }
`;
