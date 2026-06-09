import { NewScoreSnapshot, db, scoreSnapshots } from '@wild-ryft/db';

import { SyncError } from '../error.js';
import { conflictUpdateAllExcept } from '../utils.js';

export async function upsertScoreData(
  scoreData: NewScoreSnapshot[]
): Promise<void> {
  try {
    await db
      .insert(scoreSnapshots)
      .values(scoreData)
      .onConflictDoUpdate({
        target: [
          scoreSnapshots.championId,
          scoreSnapshots.rank,
          scoreSnapshots.lane,
          scoreSnapshots.snapshotAt
        ],
        set: conflictUpdateAllExcept(scoreSnapshots, ['id'])
      });
  } catch (err) {
    throw new SyncError(
      'Failed to upsert score data into the database',
      'DB_ERROR',
      false,
      { cause: err }
    );
  }
}
