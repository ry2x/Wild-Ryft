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
