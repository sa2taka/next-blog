import type { AppProps } from 'next/app';
import { Theme } from '../src/types/theme';
import { useCallback, useMemo, useState } from 'react';
import { ThemeContext } from '@/components/contexts/theme';
import { ThemeContextProps } from '../src/components/contexts/theme';
import { Header } from '@/components/organisms/Header';
import { styled } from '@linaria/react';
import { Footer } from '@/components/organisms/Footer';

import '../styles/globals.css';

// TODO: divide file
const isClient = () => typeof window !== 'undefined';
const themeKey = 'theme';
const getThemeFromStorage = (): Theme => {
  if (!isClient()) {
    return 'dark';
  }
  const theme = localStorage.getItem(themeKey);
  return theme === 'light' ? 'light' : 'dark';
};

const persistTheme = (theme: Theme): void => {
  if (!isClient()) {
    return;
  }
  localStorage.setItem(themeKey, theme);
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

  const Root = styled.div`
    min-height: 100vh;
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

  return (
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
  );
};

export default MyApp;
