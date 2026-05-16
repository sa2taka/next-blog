import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

const nextRules = {
  ...nextPlugin.configs.recommended.rules,
  ...nextPlugin.configs['core-web-vitals'].rules,
  '@next/next/no-html-link-for-pages': 'off',
};

export default [
  {
    ignores: ['.next/**', 'out/**', 'public/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextRules,
    },
    settings: {
      next: {
        rootDir: '.',
      },
    },
  },
];
