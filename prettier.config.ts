import { type Config } from 'prettier';

const config: Config = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 80,
  quoteProps: 'consistent',
  arrowParens: 'always',
  trailingComma: 'none',
  importOrder: ['^@wild-ryft/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
};

export default config;
