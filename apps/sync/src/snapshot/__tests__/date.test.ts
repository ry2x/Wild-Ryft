import { describe, expect, it } from 'vitest';

import { resolvePreviousStatsAt } from '../date.js';

describe('resolvePreviousStatsAt', () => {
  it('returns yesterday when the latest and previous day both exist', () => {
    const result = resolvePreviousStatsAt([
      new Date('2026-06-02T00:00:00.000Z'),
      new Date('2026-06-01T00:00:00.000Z'),
      new Date('2026-05-31T00:00:00.000Z')
    ]);

    expect(result).toEqual(new Date('2026-06-01T00:00:00.000Z'));
  });

  it('falls back to the previous latest date when yesterday does not exist', () => {
    const result = resolvePreviousStatsAt([
      new Date('2026-06-02T00:00:00.000Z'),
      new Date('2026-05-31T00:00:00.000Z'),
      new Date('2026-05-30T00:00:00.000Z')
    ]);

    expect(result).toEqual(new Date('2026-05-31T00:00:00.000Z'));
  });

  it('deduplicates multiple snapshots from the same day', () => {
    const result = resolvePreviousStatsAt([
      new Date('2026-06-02T12:00:00.000Z'),
      new Date('2026-06-02T00:00:00.000Z'),
      new Date('2026-06-01T00:00:00.000Z')
    ]);

    expect(result).toEqual(new Date('2026-06-01T00:00:00.000Z'));
  });

  it('returns null when there is no earlier date', () => {
    const result = resolvePreviousStatsAt([
      new Date('2026-06-02T00:00:00.000Z')
    ]);

    expect(result).toBeNull();
  });
});
