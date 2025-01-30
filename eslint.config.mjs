export default [
  {
    ignores: ['public/js/**/*', 'docs/**/*', 'mod/utils/bcrypt.js'],
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
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
