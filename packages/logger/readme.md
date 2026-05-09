# @wild-ryft/logger

Shared logging module for the Wild Ryft monorepo.

Provides a single logger interface used across bot, web, and sync packages.

## Scope

- Standardized log creation
- Common log levels and bindings
- Lightweight wrapper around pino

## Usage

```ts
import { createLogger } from '@wild-ryft/logger';

const logger = createLogger({
  name: 'service-name',
  level: 'info',
  bindings: { app: 'service-name' }
});

logger.info('Service started');
logger.error('Request failed', { error: new Error('example') });
```

Supported levels: `debug`, `info`, `warn`, `error`, `fatal`.

## Notes

- Keep this package generic and reusable.
- Do not add app-specific business logic here.
