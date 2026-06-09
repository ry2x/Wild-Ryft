import { Lane, Rank } from '@wild-ryft/shared';

export interface LastChampionStats {
  championId: string;
  lane: Lane;
  rank: Rank;
  winRate: string;
  pickRate: string;
  banRate: string;
}
