import { Lane, Rank } from '@wild-ryft/shared';

import { WRLane, WRRankRange } from './types/wrStatsApi.js';

/**
 * The mapping of lane names from CN API to the corresponding Lanes type.
 */
export const CN_LANE_MAPPING: Record<string, Lane> = {
  中路: 'mid',
  打野: 'jungle',
  单人路: 'top',
  辅助: 'support',
  射手: 'bot'
} as const;

/**
 * The mapping of lanes for champions that are not available in Wild Rift.
 */
export const NO_WR_LANE: Record<string, Lane[]> = {
  Anivia: ['mid'],
  Aphelios: ['bot'],
  Azir: ['mid'],
  Belveth: ['jungle'],
  Briar: ['mid', 'jungle'],
  Cassiopeia: ['mid', 'top'],
  Chogath: ['mid', 'top'],
  Elise: ['jungle'],
  Gangplank: ['mid', 'top'],
  Hwei: ['mid', 'support'],
  Illaoi: ['top'],
  Ivern: ['jungle'],
  Karthus: ['mid', 'jungle'],
  Kled: ['top'],
  Leblanc: ['mid'],
  Malzahar: ['mid'],
  Naafiri: ['mid', 'jungle'],
  Neeko: ['mid', 'support'],
  Qiyana: ['mid', 'jungle'],
  Quinn: ['top', 'bot'],
  RekSai: ['jungle'],
  Rell: ['support'],
  Renata: ['support'],
  Sejuani: ['jungle'],
  Shaco: ['mid', 'top', 'jungle'],
  Skarner: ['jungle'],
  Sylas: ['mid'],
  TahmKench: ['top', 'support'],
  Taric: ['top', 'support'],
  Trundle: ['top', 'jungle'],
  Udyr: ['top', 'jungle'],
  Velkoz: ['mid', 'support'],
  Xerath: ['mid', 'support'],
  Yorick: ['top'],
  Zac: ['top', 'jungle']
};

/**
 * The mapping of lane names from WR API to the corresponding Lanes
 */
export const STATS_LANE_MAPPING: Record<WRLane, Lane> = {
  '1': 'mid',
  '2': 'top',
  '3': 'bot',
  '4': 'support',
  '5': 'jungle'
};

/**
 * The mapping of rank ranges from WR API to the corresponding Rank
 */
export const STATS_RANK_MAPPING: Record<WRRankRange, Rank> = {
  '0': 'all',
  '1': 'diamond',
  '2': 'master_plus',
  '3': 'challenger',
  '4': 'super_server'
};
