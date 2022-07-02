import { ThemeContext } from '@/components/contexts/theme';
import { Footer } from '@/components/organisms/Footer';
import { Header } from '@/components/organisms/Header';
import { styled } from '@linaria/react';
import type { AppProps } from 'next/app';
import { useCallback, useMemo, useState } from 'react';
import { ThemeContextProps } from '../src/components/contexts/theme';
import { Theme } from '../src/types/theme';

import { getThemeFromStorage, persistTheme } from '@/libs/theme';
import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { SeoHead } from '@/components/organisms/SeoHead';
import { BASE_URL } from '@/libs/const';

const Root = styled.div`
  min-height: 100vh;
  display: flex;
  flex-flow: column;
`;
const MainContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  max-width: 100%;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  justify-content: center;
  /* for header */
  padding-top: 72px;
`;

const Main = styled.main`
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding: 12px;

  @media (min-width: 960px) {
    & {
      max-width: 864px;
    }
  }
`;

const DefaultHead = () => {
  return (
    <Head>
      <title>園児ニアの庭園 | sa2taka blog</title>
    </Head>
  );
};

const MyApp: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const [theme, setTheme] = useState(getThemeFromStorage());
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

  return (
    <>
      <DefaultHead />
      <SeoHead />
      <ThemeContext.Provider value={themeProviderValue}>
        <Root className={theme === 'light' ? 'theme--light' : 'theme--dark'}>
          <Header />
          <MainContainer>
            <Main>
              <Component {...pageProps} />
            </Main>
          </MainContainer>
          <Footer />
        </Root>
      </ThemeContext.Provider>
    </>
  );
};

export default MyApp;
