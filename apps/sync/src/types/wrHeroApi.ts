/**
 * Hero Information (WR API format: CN server api)
 */
export interface WRHero {
  heroId: string;
  name: string;
  title: string;
  roles: string[];
  lane: string;
  intro: string;
  avatar: string;
  card: string;
  poster: string;
  highlightprice: string;
  couponprice: string;
  alias: string;
  tags: string;
  searchkey: string;
  isWeekFree: string;
  difficultyL: string;
  damage: string;
  surviveL: string;
  assistL: string;
}

/**
 * A collection of heroes indexed by their heroId.
 * Acts as a dictionary/map of Hero objects.
 */
export interface WRHeroList {
  [heroId: string]: WRHero;
}

/**
 * The type of data returned by the CN server, not the official API for champions.
 */
export interface WRHeroData {
  heroList: WRHeroList;
}

/**
 * Added id param which is same id from riot API.
 * This id is extracted from the poster url.
 */
export interface WRHeroID extends WRHero {
  id: string;
}
