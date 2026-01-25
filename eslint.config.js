import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  eslintConfigPrettier,

  // ===== Server / shared =====
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

  // ===== Frontend (jQuery) =====
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
      },
    },
  },

  // ===== Tests (Mocha) =====
  {
    files: ['test/**/*.js', '**/*.spec.js', '**/*.test.js'],
    languageOptions: {
      globals: globals.mocha,
    },
  },
];
