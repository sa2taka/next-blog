import { ThemeContext } from '@blog/components/contexts/theme';
import { Footer } from '@blog/components/organisms/Footer';
import { Header } from '@blog/components/organisms/Header';
import type { AppProps } from 'next/app';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContextProps } from '@blog/components/contexts/theme';
import { Theme } from '@blog/types/theme';

import { SeoHead } from '@blog/components/organisms/SeoHead';
import { applyThemeClass, getThemeFromStorage, persistTheme } from '@blog/libs/theme';
import Head from 'next/head';
import '../styles/globals.css';
import styles from '@blog/styles/page-styles/_app.module.css';

const DefaultHead = () => {
  return (
    <Head>
      <title>言葉の向こうに世界を見る | sa2taka blog</title>
    </Head>
  );
};

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  // 初期値はSSRと同じ固定値にする。実際のテーマは_document.tsxのno-flashスクリプトが
  // 先にhtml要素へ反映しており、ここでのstateはDarkThemeSwitch等の表示に使うのみ。
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getThemeFromStorage());
  }, []);

  const saveTheme = useCallback((theme: Theme) => {
    setTheme(theme);
    persistTheme(theme);
    applyThemeClass(theme);
  }, []);
  const themeProviderValue = useMemo<ThemeContextProps>(
    () => ({
      theme,
      setTheme: saveTheme,
    }),
    [saveTheme, theme]
  );

  return (
    <>
      <DefaultHead />
      <SeoHead />
      <ThemeContext.Provider value={themeProviderValue}>
        <div className={styles.root}>
          <Header />
          <div className={styles.mainContainer}>
            <main className={styles.main}>
              <Component {...pageProps} />
            </main>
          </div>
          <Footer />
        </div>
      </ThemeContext.Provider>
    </>
  );
};

export default MyApp;
