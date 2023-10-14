const prettierConfig = require('./.prettierrc');

module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'unknown', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          {
            pattern: '~/**',
            group: 'internal',
          },
          {
            pattern: '../**',
            group: 'parent',
            position: 'before',
          },
          {
            pattern: './**',
            group: 'sibling',
            position: 'after',
          },
        ],
        'newlines-between': 'never',
        pathGroupsExcludedImportTypes: ['builtin'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-anonymous-default-export': 0,
    'import/no-import-module-exports': 0,
    'import/prefer-default-export': 0,
    'no-import-assign': 0,
    'no-underscore-dangle': 0,
    'prefer-regex-literals': 0,
    'class-methods-use-this': 0,
    'default-param-last': 0,
    'max-len': [
      'error',
      prettierConfig.printWidth,
      2,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['~', './src']],
        extensions: ['.js', '.jsx', '.json'],
      },
    },
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    node: true,
  },
};
