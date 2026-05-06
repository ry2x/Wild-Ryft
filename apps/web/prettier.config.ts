import { type Config } from 'prettier';

import config from '../../prettier.config.ts';

const astroConfig: Config = {
  ...config,
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
};

export default astroConfig;
