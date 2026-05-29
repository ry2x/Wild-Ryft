import { NewScoreSnapshot, db, scoreSnapshots } from '@wild-ryft/db';

import { SyncError } from '../error.js';

export async function upsertScoreData(
  scoreData: NewScoreSnapshot[]
): Promise<void> {
  try {
    await db.insert(scoreSnapshots).values(scoreData);
  } catch (err) {
    throw new SyncError(
      'Failed to upsert score data into the database',
      'DB_ERROR',
      false,
      { cause: err }
    );
  }
}
