import { sql } from 'drizzle-orm/sql/sql';
import { championMaster, db } from '@wild-ryft/db';

import {
  WRChampionStats,
  WRConvertChampionIdData
} from '../types/wrStatsApi.js';
import { fetchData } from '../utils.js';

export async function fetchStatsData(api: string): Promise<WRChampionStats> {
  const res = await fetchData<WRChampionStats>(api);
  return res.data;
}

export async function fetchChampionData(): Promise<WRConvertChampionIdData> {
  const data = await db
    .select({
      heroId: championMaster.heroId,
      championId: championMaster.champion_id
    })
    .from(championMaster)
    .where(sql`${championMaster.isWr} = true`);
  return new Map(data.map(({ heroId, championId }) => [heroId, championId]));
}
