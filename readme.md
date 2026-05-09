# Wild-Ryft

Fully rewritten and redesigned information services for League of Legends: Wild Rift.
This project provides champions statistics which is from the Chinese api and also from Riot's DataDragon.
The data is stored in a PostgreSQL database and used in the Wild-Ryft services.

> [!NOTE]
> This project is still in active development!

## Project Structure

This project uses a pnpm workspace monorepo, so the bot, sync jobs, web app, and shared packages live in a single repository.

> [!TIP]
> Every service have its own `README` with more specific documentation in their respective directories.

```text
.
├── apps
│   ├── bot    # Discord bot
│   ├── sync   # Data ingestion and sync jobs
│   └── web    # Astro + React web frontend
└── packages
    ├── db     # PostgreSQL + Drizzle ORM
    ├── logger # Logging utilities
    └── shared # Shared constants and utilities
```

## Services

| Package | Purpose |
| --- | --- |
| `@wild-ryft/bot` | Discord bot built with `discord.js` and Sapphire |
| `@wild-ryft/sync` | Fetches and normalizes champion/stat data from upstream sources |
| `@wild-ryft/web` | SSR frontend for presenting Wild Rift data |
| `@wild-ryft/db` | Database schema, migrations, and DB client |
| `@wild-ryft/logger` | Logging utilities and configuration |
| `@wild-ryft/shared` | Shared types, constants, and reusable logic |

> [!TIP]
> At the moment, all services are not ready!

## tech stack

- **Language**: TypeScript
- **Monorepo**: pnpm workspaces
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Bot**: discord.js + Sapphire Framework
- **Web**: Astro + React
- **Logger**: pino with custom adapter
## Getting Started

```bash
pnpm install
```

Create the required environment files from the provided examples and set `DATABASE_URL` plus any Discord credentials needed by the services you want to run.

## Development

I recommend to use `devcontainers` for development.

| Command | Description |
| --- | --- |
| `pnpm bot` | Start the Discord bot in watch mode |
| `pnpm web` | Start the Astro web app |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed the database with initial data |
| `pnpm build` | Build all workspace packages |
| `pnpm typecheck` | Run type checks for all packages |
| `pnpm lint` | Run ESLint in the repository |
| `pnpm format` | Format the repository with Prettier |

> [!CAUTION]
> Before PR, please make sure to run `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm build` to ensure your code compiles and types are correct.
> Also, make sure to run tests if you have added any. 

## TODO

### Stage 1

- [ ] Make MVP bot/web features

### Stage 2

- [ ] implement more features in bot/web (no specific plan yet)

## License

This repository does not currently include a dedicated license file.
