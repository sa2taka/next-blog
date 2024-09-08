import sheetStyles from '@blog/styles/shared/sheet.module.css';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faRss } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo } from 'react';
import { AnimationLink } from '../../atoms/AnimationLink';
import styles from './index.module.css';
import { ThemeContext } from '@blog/components/contexts/theme';
import { BASE_URL } from '@blog/libs/const';

export const Footer: React.FC = () => {
  const { theme } = React.useContext(ThemeContext);
  const iconColor = useMemo(() => {
    return theme === 'dark' ? '#fff' : '#000';
  }, [theme]);

  return (
    <footer className={`${styles.footerRoot} ${sheetStyles.sheet}`}>
      <div className={styles.center}>
        <AnimationLink
          href="https://twitter.com/t0p_l1ght"
          className={styles.footerLink}
        >
          <FontAwesomeIcon
            icon={faXTwitter}
            color={iconColor}
            width={18}
            style={{ paddingRight: '3px' }}
          />
          <span>筆者Xアカウント</span>
        </AnimationLink>
        <AnimationLink href="/guide" className={styles.footerLink}>
          <span>当サイト利用について</span>
        </AnimationLink>
        <AnimationLink
          href={`${BASE_URL}/rss.xml`}
          className={styles.footerLink}
        >
          <FontAwesomeIcon
            icon={faRss}
            color="#f26522"
            width={18}
            style={{ paddingRight: '3px' }}
          />
          <span>RSS</span>
        </AnimationLink>
      </div>
    </footer>
  );
};
