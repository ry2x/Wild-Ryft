export const LANES = ['top', 'jungle', 'mid', 'bot', 'support'] as const;
export type Lane = (typeof LANES)[number];

export const TIERS = ['OP', 'S', 'A', 'B', 'C'] as const;
export type Tier = (typeof TIERS)[number];

export const RANKS = [
  'all',
  'diamond',
  'master_plus',
  'challenger',
  'super_server'
] as const;
export type Rank = (typeof RANKS)[number];

export const ROLES = [
  'fighter',
  'mage',
  'assassin',
  'marksman',
  'support',
  'tank'
] as const;
export type Role = (typeof ROLES)[number];

export const LANE_LABELS: Record<Lane, string> = {
  top: 'Top Lane',
  jungle: 'Jungle',
  mid: 'Mid Lane',
  bot: 'Bot Lane',
  support: 'Support'
};
