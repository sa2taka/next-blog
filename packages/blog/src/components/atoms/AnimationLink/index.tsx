import React, { ComponentProps } from 'react';
import Link from 'next/link';
import styles from './index.module.css';

type LinkProps = ComponentProps<typeof Link>;

export const AnimationLink: React.FC<LinkProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <Link
      {...props}
      href={props.href.toString()}
      className={`${className} ${styles.animationLink}`}
    >
      {children}
    </Link>
  );
};
