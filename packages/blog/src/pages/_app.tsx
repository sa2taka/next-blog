import { ThemeContext } from '@blog/components/contexts/theme';
import { Footer } from '@blog/components/organisms/Footer';
import { Header } from '@blog/components/organisms/Header';
import type { AppProps } from 'next/app';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContextProps } from '@blog/components/contexts/theme';
import { Theme } from '@blog/types/theme';

import { SeoHead } from '@blog/components/organisms/SeoHead';
import { getThemeFromStorage, persistTheme } from '@blog/libs/theme';
import Head from 'next/head';
import '../styles/globals.css';
import { GoogleTagManager } from '@blog/components/organisms/GoogleTagManager';
import styles from '@blog/styles/page-styles/_app.module.css';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const DefaultHead = () => {
  return (
    <Head>
      <title>言葉の向こうに世界を見る | sa2taka blog</title>
    </Head>
  );
};

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const saveTheme = useCallback((theme: Theme) => {
    setTheme(theme);
    persistTheme(theme);
  }, []);
  const themeProviderValue = useMemo<ThemeContextProps>(
    () => ({
      theme,
      setTheme: saveTheme,
    }),
    [saveTheme, theme]
  );

  useEffect(() => {
    setTheme(getThemeFromStorage());
  }, []);

  return (
    <>
      {gtmId && <GoogleTagManager googleTagManagerId={gtmId} />}
      <DefaultHead />
      <SeoHead />
      <ThemeContext.Provider value={themeProviderValue}>
        <div
          className={`${styles.root} ${theme === 'light' ? 'theme--light' : 'theme--dark'}`}
        >
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
