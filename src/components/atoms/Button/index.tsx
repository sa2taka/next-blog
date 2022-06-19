import Link from 'next/link';
import React from 'react';
import { useMemo } from 'react';
import { ReactNode } from 'react';
import { baseStyle } from './buttonStyles';
import {
  iconStyle,
  smallStyle,
  xSmallStyle,
  outlinedStyle,
  defaultStyle,
  disabledStyle,
  Content,
} from './buttonStyles';

interface Props {
  disabled?: boolean;
  outlined?: boolean;
  small?: boolean;
  xSmall?: boolean;
  icon?: boolean;
  href?: string;
  color?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export const Button: React.FC<Props> = ({
  disabled,
  href,
  icon,
  outlined,
  rel,
  small,
  target,
  xSmall,
  children,
}) => {
  const className = useMemo(() => {
    const className: string[] = [baseStyle];
    if (icon) {
      className.push(iconStyle);
      if (small) {
        className.push(smallStyle);
      } else if (xSmall) {
        className.push(xSmallStyle);
      }
    } else if (outlined) {
      className.push(outlinedStyle);
    } else {
      className.push(defaultStyle);
    }

    if (disabled) {
      className.push(disabledStyle);
    }
    return className.join(' ');
  }, [disabled, icon, outlined, small, xSmall]);

  return href ? (
    <Link href={href} target={target} rel={rel}>
      <a className={className}>
        <Content>{children}</Content>
      </a>
    </Link>
  ) : (
    <button className={className} disabled={disabled}>
      <Content>{children}</Content>
    </button>
  );
};
