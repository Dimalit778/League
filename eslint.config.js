const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  ...compat.extends('expo', 'prettier'),
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text'],
              message: 'Use Text from @/components so typography and theme colors stay consistent.',
            },
            {
              name: 'react-native-safe-area-context',
              importNames: ['SafeAreaView'],
              message: 'Use Screen from @/components so safe areas and screen widths stay consistent.',
            },
          ],
        },
      ],
    },
  },
];
