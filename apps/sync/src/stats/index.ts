import { SupportedLocale } from '@wild-ryft/shared';

import { SyncConfig } from '../types/config.js';
import { fetchChampionData, fetchStatsData } from './fetch.js';
import { transformStatsData } from './transform.js';
import { upsertStatsData } from './upsert.js';
import { SyncError } from '../error.js';

export interface SyncStatsDataOptions {
  readonly config: SyncConfig;
  readonly langs: SupportedLocale[];
}

export async function syncStatsData(
  options: SyncStatsDataOptions
): Promise<void> {
  try {
    // Fetch stats data from WR API and champion ID mapping data from DB
    const wrStatsData = await fetchStatsData(options.config.WR_STATS_URL);
    const championData = await fetchChampionData();

    // Transform the fetched data into the format required for DB upsert
    const transformedData = transformStatsData({
      wrStatsData,
      convertIdData: championData
    });

    // Upsert the transformed data into the database
    await upsertStatsData(transformedData);
  } catch (err) {
    if (err instanceof SyncError) throw err;
    throw new SyncError(
      'Stats sync failed unexpectedly',
      'UNKNOWN_ERROR',
      false,
      { cause: err }
    );
  }
}
