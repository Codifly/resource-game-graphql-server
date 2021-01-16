module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      tsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  globals: {
    graphql: true,
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  rules: {
    'implicit-arrow-linebreak': 'off',
    'max-len': [
      'error',
      {
        code: 100,
        ignoreRegExpLiterals: true,
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
        ignoreTrailingComments: true,
        ignoreComments: true,
      },
    ],
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'prefer-destructuring': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'sort-imports': 'off',
    'simple-import-sort/imports': 'error',
    'linebreak-style': ['error', 'unix'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'object-curly-newline': 'off',
    'no-unused-vars': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.json'],
      },
    },
    react: {
      version: 'detect',
    },
  },
};
