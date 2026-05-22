/**
 * Hero statistics (WR API format: CN server api)
 */

export type WRHeroStats = {
  /** Unique identifier (not champion ID, used internally by the API) */
  id: number;
  /** Position/lane of the hero */
  position: string;
  /** Hero ID for API calls */
  hero_id: string; // number -> string
  /** Strength rating */
  strength: string;
  /** Weight rating: currently unused (all 0) */
  weight: string;
  /** Appearance rate */
  appear_rate: string;
  /** Appearance rate benchmark */
  appear_bzc: string;
  /** Ban rate */
  forbid_rate: string;
  /** Ban rate benchmark */
  forbid_bzc: string;
  /** Win rate */
  win_rate: string;
  /** Win rate benchmark */
  win_bzc: string;
  /** Date of the statistics */
  dtstatdate: string;
  /** Strength level */
  strength_level: string;
  /** Appearance rate as float */
  appear_rate_float: string;
  /** Ban rate as float */
  forbid_rate_float: string;
  /** Win rate as float */
  win_rate_float: string;
  /** Appearance rate as percentage */
  appear_rate_percent: string;
  /** Ban rate as percentage */
  forbid_rate_percent: string;
  /** Win rate as percentage */
  win_rate_percent: string;
};

/**
 * Rank ranges for statistics (WR API format)
 * 0:ALL 1:Dia+ 2:Mas+ 3:Ch+ 4:super server
 */
export type WRRankRange = '0' | '1' | '2' | '3' | '4';

/**
 * Lane in the game (WR API format)
 * 0:all 1:mid 2:top 3:adc 4:sup
 */
export type WRLane = '1' | '2' | '3' | '4' | '5';

/**
 * Statistics for each lanes (WR API format)
 */
export type WRLaneStats = Record<WRLane, WRHeroStats[]>;

/**
 * Statistics for each rank range (WR API format)
 */
export type WRRankStats = {
  [C in WRRankRange]: WRLaneStats;
};

/**
 * Response structure for WR champion statistics API (WR API format)
 */
export type WRChampionStats = {
  /** Result code */
  result: number;
  /** Statistics data */
  data: WRRankStats;
};

/**
 * The map of heroId to championId for champions that are present in the WR data.
 */
export type WRConvertChampionIdData = Map<string | null, string>;
