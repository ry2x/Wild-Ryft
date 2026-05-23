import { sql } from 'drizzle-orm';

import {
  NewChampionMaster,
  NewChampionText,
  championMaster,
  championTexts,
  db
} from '@wild-ryft/db';

import { SyncError } from '../error.js';
import { conflictUpdateAllExcept } from '../utils.js';

interface ChampionUpsertDataOptions {
  championMasterData: NewChampionMaster[];
  championTextData: NewChampionText[];
}

/**
 * Bulk upsert champion data into the database, handling conflicts by updating existing records.
 * @param options - The champion data to be upserted, including master and text data.
 */
export async function upsertChampionData(
  options: ChampionUpsertDataOptions
): Promise<void> {
  try {
    const { championMasterData, championTextData } = options;

    await db
      .insert(championMaster)
      .values(championMasterData)
      .onConflictDoUpdate({
        target: championMaster.champion_id,
        set: conflictUpdateAllExcept(championMaster, [
          'champion_id',
          'createdAt'
        ])
      });

    await db
      .insert(championTexts)
      .values(championTextData)
      .onConflictDoUpdate({
        target: [championTexts.championId, championTexts.locale],
        set: {
          ...conflictUpdateAllExcept(championTexts, ['championId', 'locale']),
          updatedAt: sql`now()`
        }
      });
  } catch (err) {
    throw new SyncError(
      'Failed to upsert champion data into the database',
      'DB_ERROR',
      false,
      { cause: err }
    );
  }
}
