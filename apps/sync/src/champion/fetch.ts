import { SupportedLocale } from '@wild-ryft/shared';

import { DDChampionData, DDPatchList } from '../types/ddApi.js';
import { WRHeroData } from '../types/wrHeroApi.js';
import { fetchData } from '../utils.js';

export async function fetchDDVersion(ddVersionApi: string): Promise<string> {
  const res = await fetchData<DDPatchList>(ddVersionApi);
  return res.data[0];
}

export async function fetchWRChampionData(api: string): Promise<WRHeroData> {
  const res = await fetchData<WRHeroData>(api);
  return res.data;
}

export interface FetchChampionDataOptions {
  ddVersion: string;
  ddChampionApi: string;
  lang: SupportedLocale;
}

export async function fetchChampionData(
  options: FetchChampionDataOptions
): Promise<DDChampionData> {
  const { ddVersion, ddChampionApi, lang } = options;
  const url = ddChampionApi
    .replace('{version}', ddVersion)
    .replace('{lang}', lang);
  const res = await fetchData<DDChampionData>(url);
  return res.data;
}
