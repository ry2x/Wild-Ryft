# @wild-ryft/shared

Shared constants, types, and lightweight utilities for the Wild Ryft monorepo.

## Scope

This package is used by multiple modules (bot, web, and sync). Keep it reusable and package-agnostic.

Includes:

- TypeScript types and interfaces
- Constants and enums
- i18n resources
- Small utility helpers

## Guidelines

- Do not add code that is specific to a single module.
- Avoid dependencies on app-level packages.
- Use the dedicated packages for database and logging concerns.

## Development

- Export reusable APIs from `src/index.ts`.
- Keep changes stable, since many packages depend on this module.
