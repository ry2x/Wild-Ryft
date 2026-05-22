import { NewChampionStats } from '@wild-ryft/db';

import {
  WRChampionStats,
  WRLane,
  WRRankRange,
  WRConvertChampionIdData
} from '../types/wrStatsApi.js';
import { STATS_RANK_MAPPING, STATS_LANE_MAPPING } from '../constants.js';
import { SyncError } from '../error.js';

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
            pickRateBzc: Number(hero.appear_bzc),
            banRate: hero.forbid_rate_float,
            banRateBzc: Number(hero.forbid_bzc),
            winRate: hero.win_rate_float,
            winRateBzc: Number(hero.win_bzc),
            strength: Number(hero.strength),
            strengthLevel: Number(hero.strength_level),
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
