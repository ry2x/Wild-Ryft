import { championStats, db, scoreSnapshots } from '@wild-ryft/db';

import { TransformedChampionData } from './transform.js';

export async function upsertStatsData(
  options: TransformedChampionData
): Promise<void> {
  const { statsData, snapshotData } = options;

  // Upsert champion stats data
  await db.insert(championStats).values(statsData);

  // Upsert score snapshot data
  await db.insert(scoreSnapshots).values(snapshotData);
}
