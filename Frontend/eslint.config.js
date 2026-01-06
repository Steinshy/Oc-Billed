import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-underscore-dangle': 'off',
      'prefer-const': 'warn',
      'no-param-reassign': ['warn', { props: false }],
      'no-alert': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', '**/lcov-report/**'],
  },
];

