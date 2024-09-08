import { WebPImage } from '@blog/components/atoms/WebpImage';
import Link from 'next/link';
import React from 'react';
import { AnimationLink } from '@blog/components/atoms/AnimationLink';
import { BothSideBox } from '../../atoms/BothSideBox';
import sheetStyles from '@blog/styles/shared/sheet.module.css';
import { DarkThemeSwitch } from '@blog/components/molecules/DarkThemeSwitch';
import styles from './index.module.css';

const LeftSide: React.FC = () => {
  return (
    <Link href="/" className={styles.title}>
      <WebPImage
        file="/icon.webp"
        altFile="/icon.png"
        altText="logo"
        width={20.88}
        height={36}
      />
      <h1 className={styles.titleText}>言葉の向こうに世界を見る</h1>
    </Link>
  );
};

const RightSide: React.FC = () => {
  return (
    <div className={styles.rightSideRoot}>
      <nav className={styles.rightSideNav}>
        <AnimationLink href="/" className={styles.rightSideLink}>
          Home
        </AnimationLink>
        <AnimationLink href="/category" className={styles.rightSideLink}>
          Category
        </AnimationLink>
        <AnimationLink href="/til" className={styles.rightSideLink}>
          TIL
        </AnimationLink>
      </nav>
      <DarkThemeSwitch />
    </div>
  );
};

export const Header: React.FC = () => {
  return (
    <header className={`${styles.appBar} ${sheetStyles.sheet}`}>
      <BothSideBox
        className={`${styles.fullWidth} ${styles.alignCenter}`}
        start={<LeftSide />}
        end={<RightSide />}
      />
    </header>
  );
};
