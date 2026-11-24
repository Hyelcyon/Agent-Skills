import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'eqeqeq': ['error', 'always'],
      'no-implicit-coercion': 'error',
      'no-param-reassign': 'error'
    }
  }
];
