// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default defineConfig([
  ...expoConfig,
  {
    settings: {
      'import/resolver': {
        'babel-module': {},
      },
    },
    rules: {
      'import/no-unresolved': [
        2,
        { ignore: ['@env'] },
      ],
    },
    ignores: ['dist/*'],
  },
]);
