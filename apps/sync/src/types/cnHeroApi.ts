/**
 * Hero Information (CN API format)
 */

export interface CNHero {
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
export interface CNHeroList {
  [heroId: string]: CNHero;
}

/**
 * The type of data returned by the cn not the officially API for champions.
 */
export interface CNHeroData {
  heroList: CNHeroList;
}
