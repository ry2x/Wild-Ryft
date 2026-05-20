import { Role } from '@wild-ryft/shared';

/**
 * The list of available patch in DataDragon.
 */
export type DDPatchList = string[];

/**
 * The type of data returned by the DataDragon for champions.
 */
export interface DDChampionData {
  type: string;
  format: string;
  version: string;
  data: Record<string, DDChampion>;
}

/**
 * The type of data returned by the DataDragon for a champion.
 */
export interface DDChampion {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: DDChampionInfo;
  image: DDChampionImage;
  tags: Role[];
  partype: string;
  stats: DDChampionStats;
}

export interface DDChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface DDChampionImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DDChampionStats {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  critperlevel: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
}
