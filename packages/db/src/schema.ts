import {
  pgTable,
  bigint,
  text,
  boolean,
  integer,
  numeric,
  doublePrecision,
  date,
  timestamp,
  unique,
  index,
  check,
  primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { POSITIONS, RANKS } from '@wild-ryft/shared';

export const championMaster = pgTable(
  'champion_master',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    championKey: text('champion_key').notNull().unique(),
    heroId: text('hero_id').unique(),
    roles: text('roles')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    championType: text('champion_type').notNull(),
    isWr: boolean('is_wr').notNull().default(false),
    lanes: text('lanes')
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
      sql`${t.difficult} BETWEEN 1 AND 3`
    ),
    check('champion_master_damage_range', sql`${t.damage} BETWEEN 1 AND 3`),
    check('champion_master_survive_range', sql`${t.survive} BETWEEN 1 AND 3`),
    check('champion_master_utility_range', sql`${t.utility} BETWEEN 1 AND 3`)
  ]
);

export const championTexts = pgTable(
  'champion_texts',
  {
    championId: bigint('champion_id', { mode: 'number' })
      .notNull()
      .references(() => championMaster.id, { onDelete: 'cascade' }),
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
    championId: bigint('champion_id', { mode: 'number' })
      .notNull()
      .references(() => championMaster.id, { onDelete: 'cascade' }),
    rank: text('rank', { enum: RANKS }).notNull(),
    position: text('position', { enum: POSITIONS }).notNull(),
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
    check('champion_stats_strength_range', sql`${t.strength} BETWEEN 1 AND 40`),
    check(
      'champion_stats_strength_level_range',
      sql`${t.strengthLevel} BETWEEN 0 AND 5`
    ),
    unique('uq_champion_stats_snapshot').on(
      t.championId,
      t.rank,
      t.position,
      t.statsAt
    ),
    index('idx_champion_stats_at').on(t.statsAt),
    index('idx_champion_stats_champion_id').on(t.championId),
    index('idx_champion_stats_rank').on(t.rank),
    index('idx_champion_stats_position').on(t.position)
  ]
);

export const tierSnapshots = pgTable(
  'tier_snapshots',
  {
    id: bigint('id', { mode: 'number' })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    championId: bigint('champion_id', { mode: 'number' })
      .notNull()
      .references(() => championMaster.id, { onDelete: 'cascade' }),
    score: doublePrecision('score').notNull(),
    tier: text('tier').notNull(),
    sourceDate: date('source_date').notNull(),
    createdAt: timestamp('created_at', { precision: 2 }).notNull().defaultNow()
  },
  (t) => [
    unique('uq_tier_snapshots_champion_date').on(t.championId, t.sourceDate),
    index('idx_tier_snapshots_source_date').on(t.sourceDate)
  ]
);

export type ChampionMaster = typeof championMaster.$inferSelect;
export type ChampionText = typeof championTexts.$inferSelect;
export type ChampionStats = typeof championStats.$inferSelect;
export type TierSnapshot = typeof tierSnapshots.$inferSelect;
