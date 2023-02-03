module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    eqeqeq: 'off',
    quotes: ['error', 'single' , { 'allowTemplateLiterals': true }]
  }
}