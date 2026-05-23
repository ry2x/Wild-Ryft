import { closeDb } from '@wild-ryft/db';
import type { Logger } from '@wild-ryft/logger';
import { SupportedLocale } from '@wild-ryft/shared';

import { syncChampionData } from './champion/index.js';
import { loadConfig } from './config.js';
import { SyncError } from './error.js';
import { syncStatsData } from './stats/index.js';

export interface RunSyncOptions {
  readonly logger: Logger;
  readonly langs: SupportedLocale[];
}

export async function runSync(options: RunSyncOptions): Promise<void> {
  const { logger, langs } = options;
  const config = loadConfig();

  logger.debug('Loaded sync config', { keys: Object.keys(config) });
  logger.info('Sync process initialized', { endpoints: Object.keys(config) });

  try {
    await runTask('champion', logger, () =>
      syncChampionData({ config, langs })
    );

    await runTask('champion_stats', logger, () =>
      syncStatsData({ config, langs })
    );
  } finally {
    await closeDb();
  }
}

async function runTask(
  name: string,
  logger: Logger,
  task: () => Promise<void>
): Promise<void> {
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
