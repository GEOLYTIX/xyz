export default [
  {
    ignores: ['public/js/**/*', 'docs/**/*'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'prefer-const': [
        'error',
        {
          destructuring: 'any',
          ignoreReadBeforeAssign: true,
        },
      ],
      'max-depth': [
        'error',
        {
          max: 4,
        },
      ],
      // complexity: ['error', { max: 15 }],
      'no-nested-ternary': 'error',
    },
  },
];
