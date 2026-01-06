import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      'import/extensions': ['error', 'always', { ignorePackages: true }],
      'import/no-unresolved': 'off',
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-underscore-dangle': 'off',
      'consistent-return': 'warn',
      'prefer-const': 'warn',
      'no-param-reassign': ['warn', { props: false }],
    },
  },
  {
    ignores: ['tests/**', '**/*.test.js', 'setupTests.js', 'migrations/**', 'models/**', 'node_modules/**', 'public/**'],
  },
];

