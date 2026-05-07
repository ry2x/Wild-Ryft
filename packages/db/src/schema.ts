import {
  pgTable,
  bigint,
  varchar,
  doublePrecision,
  date,
  timestamp,
  unique,
  index
} from 'drizzle-orm/pg-core';

export const championMaster = pgTable('champion_master', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  key: varchar('key', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
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
    createdAt: timestamp('created_at').notNull().defaultNow()
  },
  (t) => [
    unique('uq_tier_snapshots_champion_date').on(t.championId, t.sourceDate),
    index('idx_tier_snapshots_source_date').on(t.sourceDate)
  ]
);

export type ChampionMaster = typeof championMaster.$inferSelect;
export type ChampionStats = typeof championStats.$inferSelect;
export type TierSnapshot = typeof tierSnapshots.$inferSelect;
