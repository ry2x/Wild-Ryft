import {
  pgTable,
  bigint,
  text,
  varchar,
  doublePrecision,
  date,
  timestamp,
  unique,
  index,
  check,
  primaryKey
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const championMaster = pgTable(
  'champion_master',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    championKey: text('champion_key').notNull().unique(),
    heroId: text('hero_id').unique(),
    createdAt: timestamp('created_at', { precision: 2 }).notNull().defaultNow()
  },
  (t) => [
    check(
      'champion_master_hero_id_not_empty',
      sql`${t.heroId} IS NULL OR ${t.heroId} <> ''`
    )
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
    patch: varchar('patch', { length: 32 }).notNull(),
    winRate: doublePrecision('win_rate').notNull(),
    pickRate: doublePrecision('pick_rate').notNull(),
    banRate: doublePrecision('ban_rate').notNull(),
    statsDate: date('stats_date').notNull(),
    createdAt: timestamp('created_at', { precision: 2 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { precision: 2 }).notNull().defaultNow()
  },
  (t) => [
    unique('uq_champion_stats_date_patch').on(
      t.championId,
      t.statsDate,
      t.patch
    ),
    index('idx_champion_stats_date').on(t.statsDate),
    index('idx_champion_stats_champion_id').on(t.championId)
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
    tier: varchar('tier', { length: 2 }).notNull(),
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
