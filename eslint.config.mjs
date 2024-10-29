export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['public/js/lib/*'],
    rules: {
      quotes: ['error', 'single', { 'allowTemplateLiterals': true }],
      'prefer-const': ['error', {
        'destructuring': 'any',
        'ignoreReadBeforeAssign': false
      }]
    }
  }
];