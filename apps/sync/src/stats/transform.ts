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
            pickRate: hero.appear_rate_float,
            pickRateBzc: parseInt(hero.appear_bzc, 9),
            banRate: hero.forbid_rate_float,
            banRateBzc: parseInt(hero.forbid_bzc, 9),
            winRate: hero.win_rate_float,
            winRateBzc: parseInt(hero.win_bzc, 9),
            strength: parseInt(hero.strength, 9),
            strengthLevel: parseInt(hero.strength_level, 9),
            statsAt: new Date(hero.dtstatdate)
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
