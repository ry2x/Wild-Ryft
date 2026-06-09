import axios, { AxiosResponse } from 'axios';
import { Column, getTableColumns, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

import { SyncError } from './error.js';

const FETCH_TIMEOUT_MS = 30_000;

export async function fetchData<T>(url: string): Promise<AxiosResponse<T>> {
  try {
    return await axios.get<T>(url, { timeout: FETCH_TIMEOUT_MS });
  } catch (err) {
    throw new SyncError(
      `Failed to fetch data from ${url}`,
      'FETCH_ERROR',
      true,
      { cause: err }
    );
  }
}

/**
 * Builds an `onConflictDoUpdate` set object referencing `excluded.*` for all
 * columns except the ones listed in `except` (e.g. primary key, createdAt).
 */
export function conflictUpdateAllExcept<T extends PgTable>(
  table: T,
  except: (keyof T['_']['columns'])[]
): Record<string, unknown> {
  const columns = getTableColumns(table);
  return Object.fromEntries(
    Object.entries(columns)
      .filter(([key]) => !except.includes(key as keyof T['_']['columns']))
      .map(([key, col]) => [
        key,
        sql`excluded.${sql.identifier((col as Column).name)}`
      ])
  );
}
