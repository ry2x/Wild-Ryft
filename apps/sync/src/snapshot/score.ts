import { ChampionStats, NewScoreSnapshot } from '@wild-ryft/db';
import { Tier } from '@wild-ryft/shared';

import { LastChampionStats } from '../types/momentum.js';

export interface generateAllChampionScoresOptions {
  championStats: ChampionStats[];
  lastChampionStats: LastChampionStats[];
}

export function generateAllChampionScores(
  options: generateAllChampionScoresOptions
): NewScoreSnapshot[] {
  const { championStats, lastChampionStats } = options;
  // Group champion stats by rank and lane
  const grouped = groupByRankAndLane(championStats);
  const lastGrouped = groupByRankAndLane(lastChampionStats);

  const allScores: NewScoreSnapshot[] = [];

  // Generate scores for each group
  for (const groupKey in grouped) {
    const groupStats = grouped[groupKey];
    const lastGroupStats = lastGrouped[groupKey] || [];
    const snapshots = generateScoresForGroup({
      championStats: groupStats,
      lastChampionStats: lastGroupStats
    });
    allScores.push(...snapshots);
  }

  return allScores;
}

function groupByRankAndLane<T extends ChampionStats | LastChampionStats>(
  stats: T[]
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  for (const stat of stats) {
    const groupKey = `${stat.rank}_${stat.lane}`;
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(stat);
  }
  return grouped;
}

function generateScoresForGroup(
  option: generateAllChampionScoresOptions
): NewScoreSnapshot[] {
  const { championStats: statsList, lastChampionStats: lastStatsList } = option;
  if (statsList.length === 0) return [];

  // 1. Calculate Environment Averages
  let totalWinRate = 0;
  let totalPickRate = 0;
  let totalBanRate = 0;

  const parsedStats = statsList.map((stats) => {
    const win = parseFloat(stats.winRate);
    const pick = parseFloat(stats.pickRate);
    const ban = parseFloat(stats.banRate);
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

    // 4. Momentum Score Calculation
    // Momentum is based on how the current score compares to the last snapshot's score
    // Win Rate is heavily weighted (x2), Ban Rate (x1.5) since it indicates 'fear/strength', Pick Rate (x1)
    // I think <2.5 score change is just noise
    const lastStats = lastStatsList.find(
      (s) => s.championId === stats.championId
    ) || {
      championId: stats.championId,
      winRate: stats.winRate,
      pickRate: stats.pickRate,
      banRate: stats.banRate,
      lane: stats.lane,
      rank: stats.rank
    };

    const winDiff = win - parseFloat(lastStats.winRate);
    const pickDiff = pick - parseFloat(lastStats.pickRate);
    const banDiff = ban - parseFloat(lastStats.banRate);

    const momentumScore = winDiff * 2 + pickDiff + banDiff * 1.5;

    return {
      championId: stats.championId,
      rank: stats.rank,
      lane: stats.lane,
      snapshotAt: new Date(),
      score: Math.round(score),
      tier,
      presenceRate: Math.round(pick + ban),
      momentumScore: momentumScore.toFixed(6)
    };
  });
}
