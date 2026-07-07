import { db } from '@wild-ryft/db';
import {
  championMaster,
  championTexts,
  championStats,
  scoreSnapshots,
} from '@wild-ryft/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { Lane, Rank, Tier, Role } from '@wild-ryft/shared';

export interface ChampionWithText {
  id: string;
  key: string;
  heroId: string | null;
  roles: Role[];
  championType: string;
  isWr: boolean;
  lanes: Lane[];
  isFree: boolean;
  difficult: number;
  damage: number;
  survive: number;
  utility: number;
  name: string;
  title: string | null;
  description: string | null;
}

export interface TierListItem {
  championId: string;
  name: string;
  title: string | null;
  lane: Lane;
  rank: Rank;
  score: number;
  tier: Tier;
  presenceRate: number;
  momentumScore: string;
  winRate: string;
  pickRate: string;
  banRate: string;
}

// ──────────────────────────────────────
// Helper: latest date from score_snapshots
// ──────────────────────────────────────
async function getLatestScoreDate(rank: Rank = 'all'): Promise<Date | null> {
  const result = await db
    .select({ d: sql<string>`MAX(${scoreSnapshots.snapshotAt})` })
    .from(scoreSnapshots)
    .where(eq(scoreSnapshots.rank, rank));
  return result[0]?.d ? new Date(result[0].d) : null;
}

// ──────────────────────────────────────
// Helper: latest date from champion_stats
// ──────────────────────────────────────
async function getLatestStatsDate(rank: Rank = 'all'): Promise<Date | null> {
  const result = await db
    .select({ d: sql<string>`MAX(${championStats.statsAt})` })
    .from(championStats)
    .where(eq(championStats.rank, rank));
  return result[0]?.d ? new Date(result[0].d) : null;
}

// Re-export for pages that just need the latest date
export { getLatestScoreDate as getLatestSnapshotDate };

// ──────────────────────────────────────
// Get champions list with localization
// ──────────────────────────────────────
export async function getChampions(locale: string = 'ja_JP'): Promise<ChampionWithText[]> {
  try {
    const rows = await db
      .select({
        id: championMaster.champion_id,
        key: championMaster.championKey,
        heroId: championMaster.heroId,
        roles: championMaster.roles,
        championType: championMaster.championType,
        isWr: championMaster.isWr,
        lanes: championMaster.lanes,
        isFree: championMaster.isFree,
        difficult: championMaster.difficult,
        damage: championMaster.damage,
        survive: championMaster.survive,
        utility: championMaster.utility,
        name: championTexts.name,
        title: championTexts.title,
        description: championTexts.description,
      })
      .from(championMaster)
      .leftJoin(
        championTexts,
        and(
          eq(championMaster.champion_id, championTexts.championId),
          eq(championTexts.locale, locale)
        )
      )
      .orderBy(championTexts.name);

    return rows.map((r) => ({
      ...r,
      name: r.name || r.id,
      title: r.title || null,
      description: r.description || null,
      roles: (r.roles || []) as Role[],
      lanes: (r.lanes || []) as Lane[],
    }));
  } catch (error) {
    console.error(`Error fetching champions for locale ${locale}:`, error);
    return [];
  }
}

// ──────────────────────────────────────
// Get tier list — score_snapshots as primary,
// champion_stats joined independently by its OWN latest date
// ──────────────────────────────────────
export async function getTierList(
  locale: string = 'ja_JP',
  rank: Rank = 'all',
  lane: Lane | 'all' = 'all'
): Promise<TierListItem[]> {
  try {
    // 1) Get latest dates from EACH table independently
    const [latestScoreDt, latestStatsDt] = await Promise.all([
      getLatestScoreDate(rank),
      getLatestStatsDate(rank),
    ]);

    if (!latestScoreDt) return [];

    // 2) Fetch score rows
    const scoreConditions = [
      eq(scoreSnapshots.snapshotAt, latestScoreDt),
      eq(scoreSnapshots.rank, rank),
    ];
    if (lane !== 'all') {
      scoreConditions.push(eq(scoreSnapshots.lane, lane));
    }

    const scores = await db
      .select({
        championId: scoreSnapshots.championId,
        lane: scoreSnapshots.lane,
        rank: scoreSnapshots.rank,
        score: scoreSnapshots.score,
        tier: scoreSnapshots.tier,
        presenceRate: scoreSnapshots.presenceRate,
        momentumScore: scoreSnapshots.momentumScore,
        name: championTexts.name,
        title: championTexts.title,
      })
      .from(scoreSnapshots)
      .leftJoin(
        championTexts,
        and(
          eq(scoreSnapshots.championId, championTexts.championId),
          eq(championTexts.locale, locale)
        )
      )
      .where(and(...scoreConditions))
      .orderBy(desc(scoreSnapshots.score));

    if (scores.length === 0) return [];

    // 3) Fetch stats at the STATS table's own latest date
    let statsMap = new Map<string, { winRate: string; pickRate: string; banRate: string }>();
    if (latestStatsDt) {
      const statsConditions = [
        eq(championStats.statsAt, latestStatsDt),
        eq(championStats.rank, rank),
      ];
      if (lane !== 'all') {
        statsConditions.push(eq(championStats.lane, lane));
      }

      const statsList = await db
        .select({
          championId: championStats.championId,
          lane: championStats.lane,
          winRate: championStats.winRate,
          pickRate: championStats.pickRate,
          banRate: championStats.banRate,
        })
        .from(championStats)
        .where(and(...statsConditions));

      for (const s of statsList) {
        statsMap.set(`${s.championId}_${s.lane}`, s);
      }
    }

    // 4) Merge
    return scores.map((s) => {
      const stat = statsMap.get(`${s.championId}_${s.lane}`);
      return {
        championId: s.championId,
        name: s.name || s.championId,
        title: s.title || null,
        lane: s.lane as Lane,
        rank: s.rank as Rank,
        score: s.score,
        tier: s.tier as Tier,
        presenceRate: s.presenceRate,
        momentumScore: s.momentumScore,
        winRate: stat?.winRate ?? '-',
        pickRate: stat?.pickRate ?? '-',
        banRate: stat?.banRate ?? '-',
      };
    });
  } catch (error) {
    console.error('Error fetching tier list:', error);
    return [];
  }
}

// ──────────────────────────────────────
// Fetch win rate trend history for a champion
// ──────────────────────────────────────
export async function getChampionTrends(
  championId: string,
  rank: Rank = 'all',
  lane: Lane | 'all' = 'all'
) {
  try {
    const conditions = [
      eq(championStats.championId, championId),
      eq(championStats.rank, rank),
    ];
    if (lane !== 'all') {
      conditions.push(eq(championStats.lane, lane));
    }

    const history = await db
      .select({
        winRate: championStats.winRate,
        pickRate: championStats.pickRate,
        banRate: championStats.banRate,
        statsAt: championStats.statsAt,
        lane: championStats.lane,
      })
      .from(championStats)
      .where(and(...conditions))
      .orderBy(championStats.statsAt);

    return history.map((h) => ({
      winRate: parseFloat(h.winRate),
      pickRate: parseFloat(h.pickRate),
      banRate: parseFloat(h.banRate),
      statsAt: h.statsAt,
      lane: h.lane as Lane,
    }));
  } catch (error) {
    console.error(`Error fetching trends for champion ${championId}:`, error);
    return [];
  }
}

// ──────────────────────────────────────
// Fetch single champion detail
// ──────────────────────────────────────
export async function getChampionDetail(
  championId: string,
  locale: string = 'ja_JP',
  rank: Rank = 'all',
  lane: Lane | 'all' = 'all'
) {
  try {
    // 1. Fetch Master Info
    const master = await db
      .select({
        id: championMaster.champion_id,
        key: championMaster.championKey,
        heroId: championMaster.heroId,
        roles: championMaster.roles,
        championType: championMaster.championType,
        isWr: championMaster.isWr,
        lanes: championMaster.lanes,
        isFree: championMaster.isFree,
        difficult: championMaster.difficult,
        damage: championMaster.damage,
        survive: championMaster.survive,
        utility: championMaster.utility,
      })
      .from(championMaster)
      .where(eq(championMaster.champion_id, championId))
      .limit(1);

    if (master.length === 0) return null;

    // 2. Fetch Locale Text
    const textRow = await db
      .select({
        name: championTexts.name,
        title: championTexts.title,
        description: championTexts.description,
      })
      .from(championTexts)
      .where(and(eq(championTexts.championId, championId), eq(championTexts.locale, locale)))
      .limit(1);

    // 3. Fetch latest stats (use stats table's own latest date)
    const latestStatsDt = await getLatestStatsDate(rank);
    let latestStats = null;
    if (latestStatsDt) {
      const statsConditions = [
        eq(championStats.championId, championId),
        eq(championStats.rank, rank),
        eq(championStats.statsAt, latestStatsDt),
      ];
      if (lane !== 'all') {
        statsConditions.push(eq(championStats.lane, lane));
      }

      const statsResult = await db
        .select({
          winRate: championStats.winRate,
          pickRate: championStats.pickRate,
          banRate: championStats.banRate,
          strength: championStats.strength,
          strengthLevel: championStats.strengthLevel,
          lane: championStats.lane,
        })
        .from(championStats)
        .where(and(...statsConditions));

      latestStats = statsResult.length > 0 ? statsResult : null;
    }

    // 4. Fetch score snapshot (use score table's own latest date)
    const latestScoreDt = await getLatestScoreDate(rank);
    let scoreInfo = null;
    if (latestScoreDt) {
      const scoreConditions = [
        eq(scoreSnapshots.championId, championId),
        eq(scoreSnapshots.rank, rank),
        eq(scoreSnapshots.snapshotAt, latestScoreDt),
      ];
      if (lane !== 'all') {
        scoreConditions.push(eq(scoreSnapshots.lane, lane));
      }

      const scoreResult = await db
        .select({
          score: scoreSnapshots.score,
          tier: scoreSnapshots.tier,
          momentumScore: scoreSnapshots.momentumScore,
          presenceRate: scoreSnapshots.presenceRate,
          lane: scoreSnapshots.lane,
        })
        .from(scoreSnapshots)
        .where(and(...scoreConditions));

      scoreInfo = scoreResult.length > 0 ? scoreResult : null;
    }

    // 5. Fetch trends
    const trends = await getChampionTrends(championId, rank, lane);

    return {
      master: {
        ...master[0],
        roles: (master[0].roles || []) as Role[],
        lanes: (master[0].lanes || []) as Lane[],
      },
      text: textRow[0] || { name: championId, title: null, description: null },
      latestStats,
      scoreInfo,
      trends,
    };
  } catch (error) {
    console.error(`Error fetching detail for champion ${championId}:`, error);
    return null;
  }
}
