import { desc, eq } from 'drizzle-orm';

import { ChampionStats, championStats, db } from '@wild-ryft/db';

import { SyncError } from '../error.js';
import { LastChampionStats } from '../types/momentum.js';
import { resolvePreviousStatsAt } from './date.js';

export async function fetchChampionStatsData(): Promise<ChampionStats[]> {
  try {
    return fetchStatsDataByDate(await latestStatsAt());
  } catch (err) {
    throw new SyncError(
      'Failed to fetch champion stats data',
      'FETCH_ERROR',
      false,
      { cause: err }
    );
  }
}

export async function fetchYesterdayStatsData(): Promise<LastChampionStats[]> {
  try {
    const statsAt = await previousStatsAt();

    if (!statsAt) {
      return [];
    }

    return fetchLastChampionStatsDataByDate(statsAt);
  } catch (err) {
    throw new SyncError(
      'Failed to fetch yesterday stats data',
      'FETCH_ERROR',
      false,
      { cause: err }
    );
  }
}

async function fetchStatsDataByDate(statsAt: Date): Promise<ChampionStats[]> {
  return db
    .select()
    .from(championStats)
    .where(eq(championStats.statsAt, statsAt));
}

async function fetchLastChampionStatsDataByDate(
  statsAt: Date
): Promise<LastChampionStats[]> {
  const result = await db
    .select({
      championId: championStats.championId,
      lane: championStats.lane,
      rank: championStats.rank,
      winRate: championStats.winRate,
      pickRate: championStats.pickRate,
      banRate: championStats.banRate
    })
    .from(championStats)
    .where(eq(championStats.statsAt, statsAt));

  return result as LastChampionStats[];
}

async function latestStatsAt(): Promise<Date> {
  try {
    const result = await db
      .select({ date: championStats.statsAt })
      .from(championStats)
      .orderBy(desc(championStats.statsAt))
      .limit(1);

    if (result.length === 0) {
      throw new SyncError('No champion stats data found', 'FETCH_ERROR', false);
    }

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

async function previousStatsAt(): Promise<Date | null> {
  try {
    const result = await db
      .select({ date: championStats.statsAt })
      .from(championStats)
      .groupBy(championStats.statsAt)
      .orderBy(desc(championStats.statsAt))
      .limit(30);

    return resolvePreviousStatsAt(result.map(({ date }) => date));
  } catch (err) {
    throw new SyncError(
      'Failed to fetch previous stats date',
      'FETCH_ERROR',
      false,
      { cause: err }
    );
  }
}
