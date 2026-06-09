import { NewChampionStats, championStats, db } from '@wild-ryft/db';

import { SyncError } from '../error.js';
import { conflictUpdateAllExcept } from '../utils.js';

export async function upsertStatsData(
  statsData: NewChampionStats[]
): Promise<void> {
  try {
    await db
      .insert(championStats)
      .values(statsData)
      .onConflictDoUpdate({
        target: [
          championStats.championId,
          championStats.rank,
          championStats.lane,
          championStats.statsAt
        ],
        set: conflictUpdateAllExcept(championStats, ['id'])
      });
  } catch (err) {
    throw new SyncError(
      'Failed to upsert stats data into the database',
      'DB_ERROR',
      false,
      { cause: err }
    );
  }
}
