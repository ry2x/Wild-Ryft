import node from '@astrojs/node';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  server: {
    host: true,
    port: 4321
  },
  integrations: [react()],

  adapter: node({
    mode: 'standalone'
  })
});
