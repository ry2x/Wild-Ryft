import 'dotenv/config';
import { sql } from 'drizzle-orm';

import {
  LANES,
  ROLES,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from '@wild-ryft/shared';
import type { Lane, Role } from '@wild-ryft/shared';

import { closeDb, db } from '../index.js';
import { championMaster, championTexts } from '../schema.js';

const REPO_BASE =
  'https://raw.githubusercontent.com/ry2x/WildRift-Merged-Champion-Data/gh-pages';

interface ChampionEntry {
  id: string;
  key: number;
  name: string;
  title: string;
  describe: string;
  roles: string[];
  type: string;
  hero_id: number;
  is_wr: boolean;
  lanes: string[];
  is_free: boolean;
  difficult: number;
  damage: number;
  survive: number;
  utility: number;
}

function normalizeLane(lane: string): Lane {
  const normalized = lane === 'ad' ? 'bot' : lane;
  if (!(LANES as readonly string[]).includes(normalized)) {
    throw new Error(`Unknown lane: "${lane}"`);
  }
  return normalized as Lane;
}

async function fetchLocaleData(
  locale: SupportedLocale
): Promise<ChampionEntry[]> {
  const url = `${REPO_BASE}/data_${locale}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json() as Promise<ChampionEntry[]>;
}

export async function seedChampions(): Promise<void> {
  console.log('Seeding champions...');

  const masterData = await fetchLocaleData('en_US');

  const masterRows = masterData.map((c) => ({
    champion_id: c.id,
    championKey: String(c.key),
    heroId: c.hero_id === 0 ? null : String(c.hero_id),
    roles: c.roles.filter((r): r is Role => {
      if (!(ROLES as readonly string[]).includes(r)) {
        console.warn(`  Unknown role "${r}" for champion ${c.id}, skipping`);
        return false;
      }
      return true;
    }),
    championType: c.type,
    isWr: c.is_wr,
    lanes: c.lanes.map(normalizeLane),
    isFree: c.is_free,
    difficult: c.difficult,
    damage: c.damage,
    survive: c.survive,
    utility: c.utility
  }));

  await db
    .insert(championMaster)
    .values(masterRows)
    .onConflictDoUpdate({
      target: championMaster.champion_id,
      set: {
        championKey: sql`excluded.champion_key`,
        heroId: sql`excluded.hero_id`,
        roles: sql`excluded.roles`,
        championType: sql`excluded.champion_type`,
        isWr: sql`excluded.is_wr`,
        lanes: sql`excluded.lanes`,
        isFree: sql`excluded.is_free`,
        difficult: sql`excluded.difficult`,
        damage: sql`excluded.damage`,
        survive: sql`excluded.survive`,
        utility: sql`excluded.utility`
      }
    });

  console.log(`  Upserted ${masterRows.length} champion_master rows`);

  // Fetch all supported locales and upsert champion_texts
  const allLocaleData = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => ({
      locale,
      // Reuse already-fetched masterData for en_US to avoid a duplicate network request
      data: locale === 'en_US' ? masterData : await fetchLocaleData(locale)
    }))
  );

  const textRows = allLocaleData.flatMap(({ locale, data }) =>
    data.map((c) => ({
      championId: c.id,
      locale,
      name: c.name,
      title: c.title ?? null,
      description: c.describe ?? null
    }))
  );

  // Insert in chunks to avoid query size limits
  const CHUNK = 500;
  for (let i = 0; i < textRows.length; i += CHUNK) {
    await db
      .insert(championTexts)
      .values(textRows.slice(i, i + CHUNK))
      .onConflictDoUpdate({
        target: [championTexts.championId, championTexts.locale],
        set: {
          name: sql`excluded.name`,
          title: sql`excluded.title`,
          description: sql`excluded.description`
        }
      });
  }

  const localeCount = SUPPORTED_LOCALES.length;
  console.log(
    `  Upserted ${textRows.length} champion_texts rows (${localeCount} locales)`
  );
  console.log('Champions seeded successfully.');
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  seedChampions()
    .then(() => closeDb())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
