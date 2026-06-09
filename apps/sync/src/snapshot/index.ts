import { SyncError } from '../error.js';
import { fetchChampionStatsData, fetchYesterdayStatsData } from './fetch.js';
import { generateAllChampionScores } from './score.js';
import { upsertScoreData } from './upsert.js';

export async function syncScore(): Promise<void> {
  try {
    const championStats = await fetchChampionStatsData();
    const lastChampionStats = await fetchYesterdayStatsData();
    const allScores = generateAllChampionScores({
      championStats,
      lastChampionStats
    });
    await upsertScoreData(allScores);
  } catch (err) {
    throw new SyncError(
      'Score sync failed unexpectedly',
      'UNKNOWN_ERROR',
      false,
      { cause: err }
    );
  }
}
