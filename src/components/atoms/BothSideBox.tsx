import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React, { ReactNode } from 'react';

type Props = {
  start: ReactNode;
  end: ReactNode;
  className?: string;
};

export const BothSideBox: React.FC<Props> = ({
  start,
  end,
  className = '',
}) => {
  const flex = css`
    display: flex;
  `;
  const Spacer = styled.div`
    flex-grow: 1;
  `;
  return (
    <div className={`${flex} ${className}`}>
      {start}
      <Spacer />
      {end}
    </div>
  );
};
