import 'dotenv/config';
import { asc, eq, sql } from 'drizzle-orm';

import type { Lane, Rank, Tier } from '@wild-ryft/shared';

import { closeDb, db } from '../index.js';
import type { NewScoreSnapshot } from '../schema.js';
import { championStats, scoreSnapshots } from '../schema.js';

interface ScoreSnapshotMetrics {
  championId: string;
  rank: Rank;
  lane: Lane;
  pickRate: string;
  banRate: string;
  winRate: string;
}

function generateAllChampionScores(options: {
  championStats: ScoreSnapshotMetrics[];
  lastChampionStats: ScoreSnapshotMetrics[];
  snapshotAt: Date;
}): NewScoreSnapshot[] {
  const { championStats, lastChampionStats, snapshotAt } = options;
  const grouped = groupByRankAndLane(championStats);
  const lastGrouped = groupByRankAndLane(lastChampionStats);

  const allScores: NewScoreSnapshot[] = [];

  for (const groupKey in grouped) {
    const groupStats = grouped[groupKey];
    const lastGroupStats = lastGrouped[groupKey] || [];
    const snapshots = generateScoresForGroup({
      championStats: groupStats,
      lastChampionStats: lastGroupStats,
      snapshotAt
    });
    allScores.push(...snapshots);
  }

  return allScores;
}

function groupByRankAndLane(
  stats: ScoreSnapshotMetrics[]
): Record<string, ScoreSnapshotMetrics[]> {
  const grouped: Record<string, ScoreSnapshotMetrics[]> = {};

  for (const stat of stats) {
    const groupKey = `${stat.rank}_${stat.lane}`;
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(stat);
  }

  return grouped;
}

function generateScoresForGroup(options: {
  championStats: ScoreSnapshotMetrics[];
  lastChampionStats: ScoreSnapshotMetrics[];
  snapshotAt: Date;
}): NewScoreSnapshot[] {
  const { championStats: statsList, lastChampionStats: lastStatsList } =
    options;
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
      (candidate) => candidate.championId === stats.championId
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
      snapshotAt: options.snapshotAt,
      score: Math.round(score),
      tier,
      presenceRate: Math.round(pick + ban),
      momentumScore: momentumScore.toFixed(6)
    };
  });
}

async function fetchDistinctStatsDates(): Promise<Date[]> {
  const result = await db
    .select({ statsAt: championStats.statsAt })
    .from(championStats)
    .groupBy(championStats.statsAt)
    .orderBy(asc(championStats.statsAt));

  return result.map(({ statsAt }) => statsAt);
}

async function fetchStatsByDate(statsAt: Date) {
  return db
    .select({
      championId: championStats.championId,
      rank: championStats.rank,
      lane: championStats.lane,
      pickRate: championStats.pickRate,
      banRate: championStats.banRate,
      winRate: championStats.winRate
    })
    .from(championStats)
    .where(eq(championStats.statsAt, statsAt));
}

export async function seedScoreSnapshots(): Promise<void> {
  console.log('Seeding score snapshots from champion_stats...');

  const statsDates = await fetchDistinctStatsDates();
  if (statsDates.length === 0) {
    console.log('  No champion_stats rows found. Skipping score snapshots.');
    return;
  }

  const CHUNK = 500;
  let totalRows = 0;

  for (let i = 0; i < statsDates.length; i++) {
    const statsAt = statsDates[i];
    const previousStatsAt = i > 0 ? statsDates[i - 1] : null;

    const currentStats = await fetchStatsByDate(statsAt);
    const lastChampionStats = previousStatsAt
      ? await fetchStatsByDate(previousStatsAt)
      : [];

    const rows = generateAllChampionScores({
      championStats: currentStats,
      lastChampionStats,
      snapshotAt: statsAt
    });

    if (rows.length === 0) {
      continue;
    }

    await db.transaction(async (tx) => {
      for (let j = 0; j < rows.length; j += CHUNK) {
        await tx
          .insert(scoreSnapshots)
          .values(rows.slice(j, j + CHUNK))
          .onConflictDoUpdate({
            target: [
              scoreSnapshots.championId,
              scoreSnapshots.rank,
              scoreSnapshots.lane,
              scoreSnapshots.snapshotAt
            ],
            set: {
              score: sql`excluded.score`,
              tier: sql`excluded.tier`,
              presenceRate: sql`excluded.presence_rate`,
              momentumScore: sql`excluded.momentum_score`
            }
          });
      }
    });

    totalRows += rows.length;
    if ((i + 1) % 10 === 0 || i + 1 === statsDates.length) {
      console.log(
        `  [${i + 1}/${statsDates.length}] ${statsAt.toISOString()} — ${rows.length} rows`
      );
    }
  }

  console.log(`Score snapshots seeded: ${totalRows} rows upserted.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedScoreSnapshots()
    .then(() => closeDb())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
