import Link from 'next/link';
import React, { ComponentProps } from 'react';
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

type buttonProps = ComponentProps<'button'>;

interface Props extends buttonProps {
  disabled?: boolean;
  outlined?: boolean;
  small?: boolean;
  xSmall?: boolean;
  icon?: boolean;
  href?: string;
  color?: string;
  target?: string;
  rel?: string;
  className?: string;
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
  className: customClassName,
  children,
  ...props
}) => {
  const className = useMemo(() => {
    const className: string[] = [customClassName ?? '', baseStyle];
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
    return className.filter((c) => c).join(' ');
  }, [customClassName, disabled, icon, outlined, small, xSmall]);

  return href ? (
    <Link href={href} target={target} rel={rel}>
      <a className={className}>
        <Content>{children}</Content>
      </a>
    </Link>
  ) : (
    <button className={className} disabled={disabled} {...props}>
      <Content>{children}</Content>
    </button>
  );
};
