import { Lane, Role, SupportedLocale } from '@wild-ryft/shared';
import { NewChampionMaster, NewChampionText } from '@wild-ryft/db/schema';

import { LANE_MAPPING } from '../constants.js';
import { DDChampionData } from '../types/ddApi.js';
import { WRHeroData, WRHeroID } from '../types/wrHeroApi.js';

/**
 * Extracts champion name from poster URL using regex
 * e.g. "https://.../Garen_0.jpg" => "Garen"
 */
function extractChampionNameFromPoster(posterUrl: string): string | null {
  const match = posterUrl.match(/\/([A-Za-z]+)_\d+\.jpg$/);
  return match ? match[1] : null;
}

/**
 * Adds a derived champion ID to each WR hero entry using the poster URL.
 * Falls back to heroId if extraction fails.
 */
export function addIdToWrData(wrHeroData: WRHeroData): WRHeroID[] {
  return Object.values(wrHeroData.heroList).map((hero) => {
    const id = extractChampionNameFromPoster(hero.poster);
    return { ...hero, id: id || hero.heroId };
  });
}

interface MergeChampionDataOptions {
  riotData: DDChampionData;
  wrData: WRHeroID[];
  lang: SupportedLocale;
}

interface MergedChampion {
  masterData: NewChampionMaster[];
  textData: NewChampionText[];
}

export function mergeChampionData(
  options: MergeChampionDataOptions
): MergedChampion {
  const { riotData, wrData, lang } = options;
  const masterData: NewChampionMaster[] = [];
  const textData: NewChampionText[] = [];

  Object.values(riotData.data).forEach((champion) => {
    const wrChampion = wrData.find(
      (wrHero) => wrHero.id.toLowerCase() === champion.id.toLowerCase()
    );
    masterData.push(createMasterData({ riotChampion: champion, wrChampion }));
    textData.push(createTextData({ riotChampion: champion, lang }));
  });

  return { masterData, textData };
}

interface CreateMasterDataOptions {
  riotChampion: DDChampionData['data'][string];
  wrChampion: WRHeroID | undefined;
}

function createMasterData(options: CreateMasterDataOptions): NewChampionMaster {
  const { riotChampion, wrChampion } = options;
  return {
    champion_id: riotChampion.id,
    championKey: riotChampion.key,
    championType: riotChampion.partype,
    isWr: !!wrChampion,
    roles: riotChampion.tags.map((tag) => tag.toLowerCase() as Role),
    lanes: wrChampion ? convertLanes(wrChampion.lane) : [],
    isFree: wrChampion ? wrChampion.isWeekFree === '1' : false,
    difficult: wrChampion ? parseInt(wrChampion.difficultyL) || 0 : 0,
    damage: wrChampion ? parseInt(wrChampion.damage) || 0 : 0,
    survive: wrChampion ? parseInt(wrChampion.surviveL) || 0 : 0,
    utility: wrChampion ? parseInt(wrChampion.assistL) || 0 : 0
  };
}

/**
 * Converts semicolon-separated Chinese lane string (e.g. "中路;打野") to Lane[].
 */
function convertLanes(lanes: string): Lane[] {
  return lanes
    .split(';')
    .map((lane) => LANE_MAPPING[lane.trim()])
    .filter(Boolean) as Lane[];
}

interface CreateTextDataOptions {
  riotChampion: DDChampionData['data'][string];
  lang: SupportedLocale;
}

function createTextData(options: CreateTextDataOptions): NewChampionText {
  const { riotChampion, lang } = options;
  return {
    name: riotChampion.name,
    championId: riotChampion.id,
    locale: lang,
    title: riotChampion.title,
    description: riotChampion.blurb
  };
}
