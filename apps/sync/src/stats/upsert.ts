import { championStats, db, NewChampionStats } from '@wild-ryft/db';

import { SyncError } from '../error.js';

export async function upsertStatsData(
  statsData: NewChampionStats[]
): Promise<void> {
  try {
    await db.insert(championStats).values(statsData);
  } catch (err) {
    throw new SyncError(
      'Failed to upsert stats data into the database',
      'DB_ERROR',
      false,
      { cause: err }
    );
  }
}
