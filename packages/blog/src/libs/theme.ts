import { Theme } from '@blog/types/theme';

const isClient = () => typeof window !== 'undefined';
export const themeKey = 'theme';
export const getThemeFromStorage = (): Theme => {
  if (!isClient()) {
    return 'dark';
  }
  const theme = localStorage.getItem(themeKey);
  return theme === 'light' ? 'light' : 'dark';
};

export const persistTheme = (theme: Theme): void => {
  if (!isClient()) {
    return;
  }
  localStorage.setItem(themeKey, theme);
};
