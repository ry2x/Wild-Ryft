import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SyncError } from './error.js';
import { SYNC_CONFIG_KEYS, type SyncConfig } from './types/config.js';

function isValidSyncConfig(value: unknown): value is SyncConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const config = value as Record<string, unknown>;

  return SYNC_CONFIG_KEYS.every((key) => {
    const property = config[key];

    return typeof property === 'string' && property.trim().length > 0;
  });
}

export function loadConfig(
  configPath = join(process.cwd(), 'config.json')
): SyncConfig {
  let parsedConfig: unknown;

  try {
    parsedConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    throw new SyncError(
      `Failed to load sync config from ${configPath}`,
      'CONFIG_ERROR',
      false,
      { cause: error }
    );
  }

  if (!isValidSyncConfig(parsedConfig)) {
    throw new SyncError(
      `Invalid sync config format in ${configPath}. Expected non-empty string values for: ${SYNC_CONFIG_KEYS.join(', ')}`,
      'CONFIG_ERROR',
      false
    );
  }

  return parsedConfig;
}
