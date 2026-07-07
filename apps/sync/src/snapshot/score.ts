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
  const grouped = groupByRankAndLane(championStats);
  const lastGrouped = groupByRankAndLane(lastChampionStats);

  const allScores: NewScoreSnapshot[] = [];

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

  const WIN_WEIGHT = 5;
  const PICK_WEIGHT = 1.5;
  const BAN_WEIGHT = 1;

  return parsedStats.map(({ stats, win, pick, ban }) => {
    const winRateDelta = win - avgWinRate;
    const pickRateDelta = pick - avgPickRate;
    const banRateDelta = ban - avgBanRate;

    const score =
      50 +
      winRateDelta * WIN_WEIGHT +
      pickRateDelta * PICK_WEIGHT +
      banRateDelta * BAN_WEIGHT;

    let tier: Tier;

    if (score >= 90) {
      tier = 'OP';
    } else if (score >= 65) {
      tier = 'S';
    } else if (score >= 40) {
      tier = 'A';
    } else if (score >= 25) {
      tier = 'B';
    } else {
      tier = 'C';
    }

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
