import type { Logger } from '@wild-ryft/logger';
import { SupportedLocale } from '@wild-ryft/shared';

import { syncChampionData } from './champion.js';
import { loadConfig } from './config.js';
import { SyncError } from './error.js';

export interface RunSyncOptions {
  readonly logger: Logger;
  readonly langs: SupportedLocale[];
  readonly dbConnectionString?: string;
}

export async function runSync(options: RunSyncOptions): Promise<void> {
  if (!options.dbConnectionString) {
    throw new SyncError(
      'Database connection string is required',
      'CONFIG_ERROR',
      false
    );
  }

  const { logger, langs, dbConnectionString } = options;
  const config = loadConfig();

  logger.debug('Loaded sync config', { keys: Object.keys(config) });
  logger.info('Sync process initialized', { endpoints: Object.keys(config) });

  await runTask('champion', logger, () =>
    syncChampionData({ config, dbConnectionString, langs })
  );
}

async function runTask(name: string, logger: Logger, task: () => Promise<void>): Promise<void> {
  try {
    await task();
    logger.info(`${name} sync completed`);
  } catch (err) {
    if (err instanceof SyncError) {
      if (err.retryable) {
        logger.warn(`Retryable error in ${name} sync, skipping`, {
          code: err.code,
          message: err.message,
          cause: err.cause
        });
        return;
      }
      logger.error(`Fatal error in ${name} sync`, {
        code: err.code,
        message: err.message,
        cause: err.cause
      });
    }
    throw err;
  }
}
