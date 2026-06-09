import { describe, expect, it } from 'vitest';

import { transformStatsData } from '../transform.js';

describe('transformStatsData', () => {
  it('parses WR stats dates in yyyymmdd format', () => {
    const result = transformStatsData({
      wrStatsData: {
        result: 0,
        data: {
          '0': {
            '1': [
              {
                id: 1,
                position: '1',
                hero_id: '10065',
                strength: '10',
                weight: '0',
                appear_rate: '0',
                appear_bzc: '0',
                forbid_rate: '0',
                forbid_bzc: '0',
                win_rate: '0',
                win_bzc: '0',
                dtstatdate: '20260528',
                strength_level: '1',
                appear_rate_float: '0',
                forbid_rate_float: '0',
                win_rate_float: '0',
                appear_rate_percent: '0%',
                forbid_rate_percent: '0%',
                win_rate_percent: '0%'
              }
            ],
            '2': [],
            '3': [],
            '4': [],
            '5': []
          },
          '1': { '1': [], '2': [], '3': [], '4': [], '5': [] },
          '2': { '1': [], '2': [], '3': [], '4': [], '5': [] },
          '3': { '1': [], '2': [], '3': [], '4': [], '5': [] },
          '4': { '1': [], '2': [], '3': [], '4': [], '5': [] }
        }
      },
      convertIdData: new Map([['10065', 'Ahri']])
    });

    expect(result).toEqual([
      expect.objectContaining({
        championId: 'Ahri',
        rank: 'all',
        lane: 'mid',
        strength: 10,
        strengthLevel: 1,
        statsAt: new Date('2026-05-28T00:00:00.000Z')
      })
    ]);
  });
});
