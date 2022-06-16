import { createContext } from 'react';
import { Theme } from '../../types/theme';

export type ThemeContextProps = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const defaultValue: ThemeContextProps = {
  theme: 'dark',
  setTheme: (theme: Theme) => {
    // do nothing
  },
};
export const ThemeContext = createContext<ThemeContextProps>(defaultValue);
