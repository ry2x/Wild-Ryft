import { desc, eq } from 'drizzle-orm';

import { ChampionStats, championStats, db } from '@wild-ryft/db';

import { SyncError } from '../error.js';

export async function fetchChampionStatsData(): Promise<ChampionStats[]> {
  try {
    const championStatsData = await db
      .select()
      .from(championStats)
      .where(eq(championStats.statsAt, await latestStatsAt()));

    return championStatsData;
  } catch (err) {
    throw new SyncError(
      'Failed to fetch champion stats data',
      'FETCH_ERROR',
      false,
      { cause: err }
    );
  }
}

async function latestStatsAt(): Promise<Date> {
  try {
    const result = await db
      .select({ date: championStats.statsAt })
      .from(championStats)
      .orderBy(desc(championStats.statsAt))
      .limit(1);

    return result[0].date;
  } catch (err) {
    throw new SyncError(
      'Failed to fetch latest stats date',
      'FETCH_ERROR',
      false,
      { cause: err }
    );
  }
}
