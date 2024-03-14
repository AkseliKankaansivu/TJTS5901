module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linkbreak-style': [0, 'error', 'windows'],
    'no-empty-function': 'off',

    // temperorily closed
    qutoes: 'off',
    // 'prettier/prettier': 'off',
    // '@typescript-eslint/no-this-alias': 'warn',
  },
};
