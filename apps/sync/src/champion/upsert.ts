import {
  db,
  championMaster,
  championTexts,
  NewChampionMaster,
  NewChampionText
} from '@wild-ryft/db';
import { sql } from 'drizzle-orm';

import { conflictUpdateAllExcept } from '../utils.js';

interface ChampionUpsertDataOptions {
  championMasterData: NewChampionMaster[];
  championTextData: NewChampionText[];
}

export async function upsertChampionData(
  options: ChampionUpsertDataOptions
): Promise<void> {
  const { championMasterData, championTextData } = options;

  await db
    .insert(championMaster)
    .values(championMasterData)
    .onConflictDoUpdate({
      target: championMaster.champion_id,
      set: conflictUpdateAllExcept(championMaster, ['champion_id', 'createdAt'])
    });

  await db
    .insert(championTexts)
    .values(championTextData)
    .onConflictDoUpdate({
      target: [championTexts.championId, championTexts.locale],
      set: {
        ...conflictUpdateAllExcept(championTexts, ['championId', 'locale']),
        updatedAt: sql`now()`
      }
    });
}

