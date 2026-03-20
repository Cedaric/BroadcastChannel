import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  astro: true,
  pnpm: false,
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'node/prefer-global/process': 'off',
    'node/prefer-global/buffer': 'off',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-vars': 'off',
    'array-callback-return': 'off',
  },
})
