import { Lane, Role, SupportedLocale } from '@wild-ryft/shared';
import { NewChampionMaster, NewChampionText } from '@wild-ryft/db/schema';

import { SyncConfig } from './types/config.js';
import { SyncError } from './error.js';
import { DDChampionData, DDPatchList } from './types/ddApi.js';
import { fetchData } from './utils.js';
import { WRHeroData, WRHeroID } from './types/wrHeroApi.js';
import { LANE_MAPPING } from './constants.js';

/**
 * Interface for syncChampionData
 * @param config - Sync configuration containing API endpoints and other settings
 * @param dbConnectionString - Database connection string for upserting champion data
 * @param langs - Supported languages/locales for fetching champion data
 */
export interface SyncChampionDataOptions {
  readonly config: SyncConfig;
  readonly dbConnectionString: string;
  readonly langs: SupportedLocale[];
}

/**
 * Syncs champion data from Riot and WR APIs, merges them, and prepares for DB upsert.
 * @param options - Sync options including config, DB connection string, and supported languages
 */
export async function syncChampionData(
  options: SyncChampionDataOptions
): Promise<void> {
  try {
    // Fetch initial data
    const ver = await fetchDDVersion(options.config.DD_VERSION_API);
    const wrHeroData = await fetchWRChampionData(
      options.config.WR_CHAMPION_API
    );

    // Add IDs to WR data for easier merging later
    const wrHeroDataWithId = addIdToWrData(wrHeroData);

    // Prepare arrays to hold processed champion data
    const championMasterData: NewChampionMaster[] = [];
    const championTextData: NewChampionText[] = [];

    // Process and normalize data
    for (const lang of options.langs) {
      const championData = await fetchChampionData({
        ddVersion: ver,
        ddChampionApi: options.config.DD_CHAMPION_API,
        lang
      });
      const mergedData = mergeChampionData({
        riotData: championData,
        wrData: wrHeroDataWithId,
        lang
      });
      championMasterData.push(...mergedData.masterData);
      championTextData.push(...mergedData.textData);
    }

    // TODO: upsert champion data to DB
  } catch (err) {
    if (err instanceof SyncError) throw err;
    throw new SyncError(
      'Champion sync failed unexpectedly',
      'UNKNOWN_ERROR',
      false,
      { cause: err }
    );
  }
}

/**
 * Fetches the latest version from DD API
 * @param ddVersionApi - API endpoint to fetch the list of versions
 * @returns The latest version string
 */
async function fetchDDVersion(ddVersionApi: string): Promise<string> {
  const res = await fetchData<DDPatchList>(ddVersionApi);
  return res.data[0];
}

/**
 * Fetches champion data from WR API (It is not an official API, but a data source for champion information)
 * @param api - API endpoint to fetch champion data
 * @returns Champion data in WRHeroData format
 */
async function fetchWRChampionData(api: string): Promise<WRHeroData> {
  const res = await fetchData<WRHeroData>(api);
  return res.data;
}

/**
 * Extracts champion name from poster URL using regex
 * egg; "poster":"https:\/\/game.gtimg.cn\/images\/lgamem\/act\/lrlib\/img\/Posters\/Garen_0.jpg" => "Garen"
 * @param posterUrl - URL of champion poster image
 * @returns Extracted champion name or null if not found
 */
function extractChampionNameFromPoster(posterUrl: string): string | null {
  const match = posterUrl.match(/\/([A-Za-z]+)_\d+\.jpg$/);
  return match ? match[1] : null;
}

/**
 * Adds unique ID to champion data from CN API
 * Uses poster URL to extract champion name as ID
 * @param cnHeroData - Raw champion data from CN API
 * @returns Array of champion data with added IDs
 */
function addIdToWrData(wrHeroData: WRHeroData): WRHeroID[] {
  return Object.values(wrHeroData.heroList).map((hero) => {
    const id = extractChampionNameFromPoster(hero.poster);
    return { ...hero, id: id || hero.heroId };
  });
}

/**
 * Interface for fetchChampionData function
 * @param ddVersion - Version string for DD API
 * @param ddChampionApi - API endpoint template for fetching champion data from DD API
 * @param lang - SUPPORTED_LOCALE
 */
interface FetchChampionDataOptions {
  ddVersion: string;
  ddChampionApi: string;
  lang: SupportedLocale;
}

/**
 * Fetches champion data from DD API for a specific lang
 * @param options - fetch options including version, API endpoint template, and language
 * @returns Champion data in DDChampionData format
 */
async function fetchChampionData(
  options: FetchChampionDataOptions
): Promise<DDChampionData> {
  const { ddVersion, ddChampionApi, lang } = options;
  const url = ddChampionApi
    .replace('{version}', ddVersion)
    .replace('{lang}', lang);
  const res = await fetchData<DDChampionData>(url);
  return res.data;
}

/**
 * interface for mergeChampionData function
 * @param riotData - Champion data from Riot's DD API
 * @param wrData - Champion data from WR API with added IDs
 * @param lang - SUPPORTED_LOCALE
 */
interface MergeChampionDataOptions {
  riotData: DDChampionData;
  wrData: WRHeroID[];
  lang: SupportedLocale;
}

/**
 * Interface for merged champion data containing master and text data arrays
 * @param masterData - Array of champion master data for DB upsert
 * @param textData - Array of champion language data for DB upsert
 */
interface MergedChampion {
  masterData: NewChampionMaster[];
  textData: NewChampionText[];
}

/**
 * Creates master and language data for champions by merging Riot and WR data
 * @param options - Merge options including Riot champion data, WR champion data, and language
 * @returns Merged champion data with master and language data arrays
 */
function mergeChampionData(options: MergeChampionDataOptions): MergedChampion {
  const { riotData, wrData, lang } = options;
  const masterData: NewChampionMaster[] = [];
  const textData: NewChampionText[] = [];

  Object.values(riotData.data).map((champion) => {
    const wrChampion = wrData.find(
      (wrHero) => wrHero.id.toLowerCase() === champion.id.toLocaleLowerCase()
    );

    masterData.push(createMasterData({ riotChampion: champion, wrChampion }));
    textData.push(createTextData({ riotChampion: champion, lang }));
  });

  return { masterData, textData };
}

/**
 * Interface for createMasterData function
 * @param riotChampion - Champion data from Riot's DD API for a single champion
 * @param wrChampion - Champion data from WR API for the same champion (if exists)
 */
interface createMasterDataOptions {
  riotChampion: DDChampionData['data'][string];
  wrChampion: WRHeroID | undefined;
}

/**
 * Creates master data for a champion by merging Riot and WR data
 * @param options - Options including Riot champion data and WR champion data
 * @returns Merged champion master data for DB upsert
 */
function createMasterData(options: createMasterDataOptions): NewChampionMaster {
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
 * Converts WR lane format in Chinese to standardized lane enum
 * Splits lane string and maps to standard format
 * @param lanes - Semicolon-separated lane string from WR data (e.g. "中路;打野")
 * @returns Lane[]
 */
function convertLanes(lanes: string): Lane[] {
  return lanes
    .split(';')
    .map((lane) => LANE_MAPPING[lane.trim()])
    .filter(Boolean) as Lane[];
}

/**
 * interface for createTextData function
 * @param riotChampion - Champion data from Riot's DD API for a single champion
 * @param lang - SUPPORTED_LOCALE
 */
interface CreateTextDataOptions {
  riotChampion: DDChampionData['data'][string];
  lang: SupportedLocale;
}

/**
 * Creates language-specific text data for a champion
 * @param options - Options including Riot champion data and language
 * @returns Merged champion language data for DB upsert
 */
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
