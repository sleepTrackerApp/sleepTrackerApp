import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  eslintConfigPrettier,

  // ===== Base / shared =====
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

  // ===== Frontend (browser + jQuery + Materialize + socket.io client) =====
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jquery,
        M: 'readonly', // Materialize
        io: 'readonly', // Socket.IO client
        Chart: 'readonly', // Chart.js
        ApexCharts: 'readonly', // ApexCharts
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
