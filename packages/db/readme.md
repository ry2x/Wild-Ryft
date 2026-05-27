# @wild-ryft/db

Shared database module for the Wild Ryft monorepo.

Provides a single place for schema definitions, migrations, and database access utilities.

## Scope

- Drizzle schema and table definitions
- Migration files and config
- Shared DB client setup
- Seed scripts in `src/seed`

## Usage

```ts
import { db, closeDb } from '@wild-ryft/db';

// Query using Drizzle ORM
const users = await db.query.championMaster.findMany();

// Always close the connection when done
await closeDb();
```

All schema types and table definitions are re-exported from this module.

## Guidelines

- Keep this package as the source of truth for database structure.
- Avoid app-specific business logic in this module.
- Reuse exported schema and client APIs from other packages.

## Schema Reference

This section summarizes the current Drizzle schema defined in `src/schema.ts`.

### Shared Domain Enums

- `rank`: values from `RANKS` (`@wild-ryft/shared`)
- `lane`: values from `LANES` (`@wild-ryft/shared`)
- `roles`: values from `ROLES` (`@wild-ryft/shared`)

These are validated with DB-level check constraints in addition to TypeScript typing.

### `champion_master`

Champion master data.

- Primary key: `champion_id` (`text`)
- Unique: `champion_key`, `hero_id`
- Main columns:
	- `roles`: `text[]` (enum-constrained, default empty array)
	- `lanes`: `text[]` (enum-constrained, default empty array)
	- `champion_type`, `is_wr`, `is_free`
	- `difficult`, `damage`, `survive`, `utility`
	- `created_at`
- Checks:
	- `hero_id` must be null or non-empty string
	- `difficult`, `damage`, `survive`, `utility` are in `0..3`
	- `roles` and `lanes` must be subsets of shared enum arrays

### `champion_texts`

Localized champion text resources.

- Composite primary key: (`champion_id`, `locale`)
- Foreign key: `champion_id -> champion_master.champion_id` (`ON DELETE CASCADE`)
- Main columns: `name`, `title`, `description`, `updated_at`
- Index: `idx_champion_texts_locale` on `locale`

### `champion_stats`

Per-rank and per-lane champion metric snapshots.

- Primary key: `id` (`bigint`, identity)
- Foreign key: `champion_id -> champion_master.champion_id` (`ON DELETE CASCADE`)
- Main columns:
	- `rank`, `lane`
	- `pick_rate`, `ban_rate`, `win_rate` (`numeric(9,6)`, Drizzle `mode: 'string'`)
	- `pick_rate_bzc`, `ban_rate_bzc`, `win_rate_bzc`
	- `strength`, `strength_level`, `stats_at`
- Checks:
	- `rank` and `lane` are restricted to shared enum values
	- `strength > 0`
	- `strength_level` is in `0..5`
- Unique snapshot key:
	- `uq_champion_stats_snapshot` on (`champion_id`, `rank`, `lane`, `stats_at`)
- Indexes:
	- `idx_champion_stats_at` on `stats_at`
	- `idx_champion_stats_champion_id` on `champion_id`
	- `idx_champion_stats_rank` on `rank`
	- `idx_champion_stats_lane` on `lane`

### `score_snapshots`

Score/momentum delta snapshots used for ranking evaluation.

- Primary key: `id` (`bigint`, identity)
- Foreign key: `champion_id -> champion_master.champion_id` (`ON DELETE CASCADE`)
- Main columns:
	- `rank`, `lane`
	- `score` (`integer`)
	- `tier` (enum-constrained text)
	- `presence_rate` (`integer`, 0-100)
- Checks:
	- `rank`, `lane` and `tier` are restricted to shared enum values
- Unique snapshot key:
	- `uq_score_snapshots_snapshot` on (`champion_id`, `rank`, `lane`, `snapshot_at`)
- Indexes:
	- `idx_score_snapshots_snapshot_at` on `snapshot_at`
	- `idx_score_snapshots_rank` on `rank`
	- `idx_score_snapshots_lane` on `lane`

## Exported Types

The package exports table model select types:

- `ChampionMaster`
- `ChampionText`
- `ChampionStats`
- `ScoreSnapshot`

Use these when sharing DB result types across `apps/*` and `packages/*`.

