import React, { ReactNode } from 'react';
import styles from './index.module.css';

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
  return (
    <div className={`${styles.container} ${className}`}>
      {start}
      <div className={styles.spacer} />
      {end}
    </div>
  );
};
