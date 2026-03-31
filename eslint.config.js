import tsParser from '@typescript-eslint/parser';
import tsEslint from 'typescript-eslint';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off', // MCP SDK requires any types
      'no-console': 'off',
      'no-unused-vars': 'off',
    },
  },
];
