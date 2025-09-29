const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  // Base configuration for all files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...require('globals').node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // Allow redeclare for TypeScript pattern: const Schema = z.object({}); type Schema = z.infer<typeof Schema>;
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
  
  // Specific rules for src directory
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // Prevent relative imports that go up directories
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../**/*'],
              message: 'Relative imports with "../" are not allowed in src directory. Use @folder imports instead.',
            },
            {
              group: ['@src/*', '@src/**/*'],
              message: '@src imports are not allowed within src directory. Use direct @folder imports instead.',
            },
          ],
        },
      ],
    },
  },
  
  // Allow relative imports in test files
  {
    files: ['test/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
