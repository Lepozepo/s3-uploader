module.exports = {
  extends: ['airbnb'],
  rules: {
    'no-underscore-dangle': 0,
    'import/no-unresolved': 0,
  },
  parser: 'babel-eslint',
  env: {
    browser: true,
  },
};
