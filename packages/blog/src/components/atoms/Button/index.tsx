import Link from 'next/link';
import React, { ComponentProps, useMemo } from 'react';
import styles from './index.module.css';

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
  children: React.ReactNode;
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
    const classNames = [styles.base, customClassName];
    if (icon) {
      classNames.push(styles.icon);
      if (small) {
        classNames.push(styles.small);
      } else if (xSmall) {
        classNames.push(styles.xSmall);
      }
    } else if (outlined) {
      classNames.push(styles.outlined);
    } else {
      classNames.push(styles.default);
    }

    if (disabled) {
      classNames.push(styles.disabled);
    }
    return classNames.filter(Boolean).join(' ');
  }, [customClassName, disabled, icon, outlined, small, xSmall]);

  const content = <span className={styles.content}>{children}</span>;

  return href ? (
    <Link href={href} target={target} rel={rel} className={className}>
      {content}
    </Link>
  ) : (
    <button className={className} disabled={disabled} {...props}>
      {content}
    </button>
  );
};
