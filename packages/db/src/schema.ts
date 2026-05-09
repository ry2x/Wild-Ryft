import {
  pgTable,
  bigint,
  text,
  boolean,
  integer,
  numeric,
  doublePrecision,
  timestamp,
  unique,
  index,
  check,
  primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { LANES, RANKS, ROLES } from '@wild-ryft/shared';

const toPgTextArray = (values: readonly string[]) =>
  sql`ARRAY[${sql.join(
    values.map((v) => sql`${v}`),
    sql`, `
  )}]::text[]`;

export const championMaster = pgTable(
  'champion_master',
  {
    champion_id: text('champion_id').primaryKey(),
    championKey: text('champion_key').notNull().unique(),
    heroId: text('hero_id').unique(),
    roles: text('roles', { enum: ROLES })
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    championType: text('champion_type').notNull(),
    isWr: boolean('is_wr').notNull().default(false),
    lanes: text('lanes', { enum: LANES })
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    isFree: boolean('is_free').notNull().default(false),
    difficult: integer('difficult').notNull(),
    damage: integer('damage').notNull(),
    survive: integer('survive').notNull(),
    utility: integer('utility').notNull(),
    createdAt: timestamp('created_at', { precision: 2 }).notNull().defaultNow()
  },
  (t) => [
    check(
      'champion_master_hero_id_not_empty',
      sql`${t.heroId} IS NULL OR ${t.heroId} <> ''`
    ),
    check(
      'champion_master_difficult_range',
      sql`${t.difficult} BETWEEN 0 AND 3`
    ),
    check(
      'champion_master_roles_allowed',
      sql`${t.roles} <@ ${toPgTextArray(ROLES)}`
    ),
    check(
      'champion_master_lanes_allowed',
      sql`${t.lanes} <@ ${toPgTextArray(LANES)}`
    ),
    check('champion_master_damage_range', sql`${t.damage} BETWEEN 0 AND 3`),
    check('champion_master_survive_range', sql`${t.survive} BETWEEN 0 AND 3`),
    check('champion_master_utility_range', sql`${t.utility} BETWEEN 0 AND 3`)
  ]
);

export const championTexts = pgTable(
  'champion_texts',
  {
    championId: text('champion_id')
      .notNull()
      .references(() => championMaster.champion_id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    name: text('name').notNull(),
    title: text('title'),
    description: text('description'),
    updatedAt: timestamp('updated_at', { precision: 2 }).notNull().defaultNow()
  },
  (t) => [
    primaryKey({ columns: [t.championId, t.locale] }),
    index('idx_champion_texts_locale').on(t.locale)
  ]
);

export const championStats = pgTable(
  'champion_stats',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    championId: text('champion_id')
      .notNull()
      .references(() => championMaster.champion_id, { onDelete: 'cascade' }),
    rank: text('rank', { enum: RANKS }).notNull(),
    lane: text('lane', { enum: LANES }).notNull(),
    pickRate: numeric('pick_rate', {
      precision: 9,
      scale: 6,
      mode: 'string'
    }).notNull(),
    pickRateBzc: integer('pick_rate_bzc').notNull(),
    banRate: numeric('ban_rate', {
      precision: 9,
      scale: 6,
      mode: 'string'
    }).notNull(),
    banRateBzc: integer('ban_rate_bzc').notNull(),
    winRate: numeric('win_rate', {
      precision: 9,
      scale: 6,
      mode: 'string'
    }).notNull(),
    winRateBzc: integer('win_rate_bzc').notNull(),
    strength: integer('strength').notNull(),
    strengthLevel: integer('strength_level').notNull(),
    statsAt: timestamp('stats_at', { precision: 2 }).notNull()
  },
  (t) => [
    check(
      'champion_stats_rank_allowed',
      sql`${t.rank} = ANY(${toPgTextArray(RANKS)})`
    ),
    check(
      'champion_stats_lane_allowed',
      sql`${t.lane} = ANY(${toPgTextArray(LANES)})`
    ),
    check('champion_stats_strength_range', sql`${t.strength} > 0`),
    check(
      'champion_stats_strength_level_range',
      sql`${t.strengthLevel} BETWEEN 0 AND 5`
    ),
    unique('uq_champion_stats_snapshot').on(
      t.championId,
      t.rank,
      t.lane,
      t.statsAt
    ),
    index('idx_champion_stats_at').on(t.statsAt),
    index('idx_champion_stats_champion_id').on(t.championId),
    index('idx_champion_stats_rank').on(t.rank),
    index('idx_champion_stats_lane').on(t.lane)
  ]
);

export const tierSnapshots = pgTable(
  'tier_snapshots',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    championId: text('champion_id')
      .notNull()
      .references(() => championMaster.champion_id, { onDelete: 'cascade' }),
    rank: text('rank', { enum: RANKS }).notNull(),
    lane: text('lane', { enum: LANES }).notNull(),
    score: doublePrecision('score').notNull(),
    momentumScore: doublePrecision('momentum_score').notNull(),
    tierStatus: doublePrecision('tier_status').notNull(),
    tier: text('tier').notNull(),
    winrateDiff: numeric('winrate_diff', {
      precision: 9,
      scale: 6,
      mode: 'string'
    }).notNull(),
    banrateDiff: numeric('banrate_diff', {
      precision: 9,
      scale: 6,
      mode: 'string'
    }).notNull(),
    pickrateDiff: numeric('pickrate_diff', {
      precision: 9,
      scale: 6,
      mode: 'string'
    }).notNull(),
    snapshotAt: timestamp('snapshot_at', { precision: 2 }).notNull()
  },
  (t) => [
    check(
      'tier_snapshots_rank_allowed',
      sql`${t.rank} = ANY(${toPgTextArray(RANKS)})`
    ),
    check(
      'tier_snapshots_lane_allowed',
      sql`${t.lane} = ANY(${toPgTextArray(LANES)})`
    ),
    unique('uq_tier_snapshots_snapshot').on(
      t.championId,
      t.rank,
      t.lane,
      t.snapshotAt
    ),
    index('idx_tier_snapshots_snapshot_at').on(t.snapshotAt),
    index('idx_tier_snapshots_rank').on(t.rank),
    index('idx_tier_snapshots_lane').on(t.lane)
  ]
);

export type ChampionMaster = typeof championMaster.$inferSelect;
export type ChampionText = typeof championTexts.$inferSelect;
export type ChampionStats = typeof championStats.$inferSelect;
export type TierSnapshot = typeof tierSnapshots.$inferSelect;
