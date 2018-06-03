module.exports = {
  extends: 'airbnb',
  env: {
    browser: true,
    es6: true,
    webextensions: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  globals: {
    ENV: false,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
    },
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'function-paren-newline': ['error', 'consistent'],
    'react/prop-types': ['error', { skipUndeclared: true }],
    'no-underscore-dangle': ['off'],
    'react/sort-comp': ['off'],
    'react/no-multi-comp': ['off'],
  }
};
