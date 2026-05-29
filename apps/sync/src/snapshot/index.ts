import { SyncError } from '../error.js';
import { fetchChampionStatsData } from './fetch.js';
import { generateAllChampionScores } from './score.js';
import { upsertScoreData } from './upsert.js';

export async function syncScore(): Promise<void> {
  try {
    const championStats = await fetchChampionStatsData();
    const allScores = generateAllChampionScores(championStats);
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
