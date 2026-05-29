import { ChampionStats, NewScoreSnapshot } from '@wild-ryft/db';
import { Tier } from '@wild-ryft/shared';

export function generateAllChampionScores(
  championStats: ChampionStats[]
): NewScoreSnapshot[] {
  // Group champion stats by rank and lane
  const grouped: Record<string, ChampionStats[]> = {};

  for (const stat of championStats) {
    const groupKey = `${stat.rank}_${stat.lane}`;
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(stat);
  }

  const allScores: NewScoreSnapshot[] = [];

  // Generate scores for each group
  for (const groupKey in grouped) {
    const groupStats = grouped[groupKey];
    const snapshots = generateScoresForGroup(groupStats);
    allScores.push(...snapshots);
  }

  return allScores;
}

function generateScoresForGroup(
  statsList: ChampionStats[]
): NewScoreSnapshot[] {
  if (statsList.length === 0) return [];

  // 1. Calculate Environment Averages
  let totalWinRate = 0;
  let totalPickRate = 0;
  let totalBanRate = 0;

  const parsedStats = statsList.map((stats) => {
    const win = parseFloat(stats.winRate) * 100;
    const pick = parseFloat(stats.pickRate) * 100;
    const ban = parseFloat(stats.banRate) * 100;
    totalWinRate += win;
    totalPickRate += pick;
    totalBanRate += ban;
    return { stats, win, pick, ban };
  });

  const count = parsedStats.length;
  const avgWinRate = totalWinRate / count;
  const avgPickRate = totalPickRate / count;
  const avgBanRate = totalBanRate / count;

  // 2. Score Calculation and Mapping
  // These weights dictate how much 1% above average impacts the score.
  const WIN_WEIGHT = 5; // 1% above avg win rate = +5 score
  const PICK_WEIGHT = 1.5; // 1% above avg pick rate = +1.5 score
  const BAN_WEIGHT = 1; // 1% above avg ban rate = +1 score

  return parsedStats.map(({ stats, win, pick, ban }) => {
    // Calculate Deltas (Deviation from the environment average)
    const winRateDelta = win - avgWinRate;
    const pickRateDelta = pick - avgPickRate;
    const banRateDelta = ban - avgBanRate;

    // Base score is 50 for a perfectly average champion
    const score =
      50 +
      winRateDelta * WIN_WEIGHT +
      pickRateDelta * PICK_WEIGHT +
      banRateDelta * BAN_WEIGHT;

    // 3. Absolute Tier Assignment
    let tier: Tier;

    if (score >= 90) {
      tier = 'OP'; // OP / S+
    } else if (score >= 65) {
      tier = 'S'; // Strong / S
    } else if (score >= 40) {
      tier = 'A'; // Average / A
    } else if (score >= 25) {
      tier = 'B'; // Below Average / B
    } else {
      tier = 'C'; // Weak / C
    }

    return {
      championId: stats.championId,
      id: stats.id,
      rank: stats.rank,
      lane: stats.lane,
      snapshotAt: new Date(),
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      tier,
      presenceRate: Math.round((pick + ban) * 100) / 100
    };
  });
}
