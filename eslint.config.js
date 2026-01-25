import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  eslintConfigPrettier,

  // ===== Production / app code =====
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      eqeqeq: 'error',
    },
  },

  // ===== Test files (Mocha) =====
  {
    files: ['test/**/*.js', '**/*.spec.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
];
