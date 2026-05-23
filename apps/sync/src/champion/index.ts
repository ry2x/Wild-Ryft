import { SupportedLocale } from '@wild-ryft/shared';

import { SyncError } from '../error.js';
import { SyncConfig } from '../types/config.js';
import {
  fetchChampionData,
  fetchDDVersion,
  fetchWRChampionData
} from './fetch.js';
import { addIdToWrData, mergeChampionData } from './normalize.js';
import { upsertChampionData } from './upsert.js';

export interface SyncChampionDataOptions {
  readonly config: SyncConfig;
  readonly langs: SupportedLocale[];
}

/**
 * Syncs champion data from Riot and WR APIs, merges them, and prepares for DB upsert.
 */
export async function syncChampionData(
  options: SyncChampionDataOptions
): Promise<void> {
  try {
    // Prepare initial data from APIs
    const ver = await fetchDDVersion(options.config.DD_VERSION_API);
    const wrHeroData = await fetchWRChampionData(
      options.config.WR_CHAMPION_API
    );
    const wrHeroDataWithId = addIdToWrData(wrHeroData);

    // Make array for bulk upsert
    const championMasterData = [];
    const championTextData = [];

    // Create merged champion data for each language
    for (const lang of options.langs) {
      const championData = await fetchChampionData({
        ddVersion: ver,
        ddChampionApi: options.config.DD_CHAMPION_API,
        lang
      });
      const mergedData = mergeChampionData({
        riotData: championData,
        wrData: wrHeroDataWithId,
        lang
      });
      championMasterData.push(...mergedData.masterData);
      championTextData.push(...mergedData.textData);
    }

    // Upsert merged champion data into DB
    await upsertChampionData({
      championMasterData,
      championTextData
    });
  } catch (err) {
    if (err instanceof SyncError) throw err;
    throw new SyncError(
      'Champion sync failed unexpectedly',
      'UNKNOWN_ERROR',
      false,
      { cause: err }
    );
  }
}
