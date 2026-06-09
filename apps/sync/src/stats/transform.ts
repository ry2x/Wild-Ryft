import { NewChampionStats } from '@wild-ryft/db';

import { STATS_LANE_MAPPING, STATS_RANK_MAPPING } from '../constants.js';
import { SyncError } from '../error.js';
import {
  WRChampionStats,
  WRConvertChampionIdData,
  WRLane,
  WRRankRange
} from '../types/wrStatsApi.js';

export interface TransformedStatsData {
  wrStatsData: WRChampionStats;
  convertIdData: WRConvertChampionIdData;
}

export function transformStatsData(
  options: TransformedStatsData
): NewChampionStats[] {
  try {
    const { wrStatsData, convertIdData } = options;

    const statsData: NewChampionStats[] = Object.entries(
      wrStatsData.data
    ).flatMap(([rankKey, laneStats]) =>
      Object.entries(laneStats).flatMap(([laneKey, heroes]) =>
        heroes.flatMap((hero) => {
          const championId = convertIdData.get(hero.hero_id) || null;
          if (!championId) return [];

          return {
            championId,
            rank: STATS_RANK_MAPPING[rankKey as WRRankRange],
            lane: STATS_LANE_MAPPING[laneKey as WRLane],
            pickRate: hero.appear_rate_percent,
            pickRateBzc: parseInt(hero.appear_bzc, 10),
            banRate: hero.forbid_rate_percent,
            banRateBzc: parseInt(hero.forbid_bzc, 10),
            winRate: hero.win_rate_percent,
            winRateBzc: parseInt(hero.win_bzc, 10),
            strength: parseInt(hero.strength, 10),
            strengthLevel: parseInt(hero.strength_level, 10),
            statsAt: parseStatsDate(hero.dtstatdate)
          };
        })
      )
    );
    return statsData;
  } catch (err) {
    throw new SyncError(
      'Failed to transform stats data',
      'NORMALIZATION_ERROR',
      false,
      { cause: err }
    );
  }
}

function parseStatsDate(value: string): Date {
  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  return new Date(value);
}
