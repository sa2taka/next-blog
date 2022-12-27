import React, { ComponentProps } from 'react';
import Link from 'next/link';
import { css } from '@linaria/core';

type LinkProps = ComponentProps<typeof Link>;

export const AnimationLink: React.FC<LinkProps> = ({
  className = '',
  children,
  ...props
}) => {
  const animationLink = css`
    position: relative;
    cursor: pointer;
    text-decoration: none;

    .theme--dark & {
      color: #eee;
    }

    .theme--light & {
      color: #222;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      height: 1px;
      background-color: var(--primary-color);
      transition: 0.3s;
      transform: translateX(-50%);

      width: 0;
    }

    &:hover::after {
      width: 100%;
    }
  `;

  return (
    <Link
      {...props}
      href={props.href.toString()}
      className={`${className} ${animationLink}`}
    >
      {children}
    </Link>
  );
};
