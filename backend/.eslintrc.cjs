module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: ['standard-with-typescript'],
  env: {
    es2022: true,
    node: true,
    jest: true
  },
  rules: {}
};
