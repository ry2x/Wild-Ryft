export const SYNC_CONFIG_KEYS = [
  'WR_CHAMPION_API',
  'WR_STATS_URL',
  'DD_VERSION_API',
  'DD_CHAMPION_API'
] as const;

export type SyncConfig = Record<(typeof SYNC_CONFIG_KEYS)[number], string>;
