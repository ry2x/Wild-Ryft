import 'dotenv/config';
import { createLogger } from '@wild-ryft/logger';
import { SUPPORTED_LOCALES } from '@wild-ryft/shared';

import { runSync } from './index.js';

const logger = createLogger({
  name: 'sync-service',
  level: process.env.LOG_LEVEL,
  bindings: {
    service: 'sync'
  }
});

const langs = [...SUPPORTED_LOCALES];

runSync({ logger, langs, dbConnectionString: process.env.DB_CONNECTION_STRING }).catch(
  (error) => {
    logger.error('Sync process failed', { error });
    process.exit(1);
  }
);
