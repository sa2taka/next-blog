import { Theme } from '@blog/types/theme';

const isClient = () => typeof window !== 'undefined';
export const themeKey = 'theme';
const themeClassName = (theme: Theme) => `theme--${theme}`;

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

// _document.tsxのno-flashスクリプトが初回ペイント前にhtml要素へ同じクラスを設定する。
// SSR/CSR初回レンダリングのReact stateは常に固定値のため、ここでのDOM操作はhydration mismatchを起こさない。
export const applyThemeClass = (theme: Theme): void => {
  if (!isClient()) {
    return;
  }
  const { classList } = document.documentElement;
  classList.remove(themeClassName('dark'), themeClassName('light'));
  classList.add(themeClassName(theme));
};
