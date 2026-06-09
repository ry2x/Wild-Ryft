import 'dotenv/config';

import { createLogger } from '@wild-ryft/logger';
import { SUPPORTED_LOCALES } from '@wild-ryft/shared';

import { runSync } from './index.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const logger = createLogger({
  name: 'sync-service',
  level: process.env.LOG_LEVEL,
  bindings: {
    service: 'sync'
  }
});

const langs = [...SUPPORTED_LOCALES];

runSync({ logger, langs })
  .then(() => {
    logger.info('Sync process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Sync process failed', { error });
    process.exit(1);
  });
