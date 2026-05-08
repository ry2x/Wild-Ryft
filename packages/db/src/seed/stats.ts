import 'dotenv/config';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { sql } from 'drizzle-orm';
import { db } from '../index.js';
import { championStats } from '../schema.js';
import type { Rank, Lane } from '@wild-ryft/shared';

const STATS_REPO = 'https://github.com/ry2x/WildRift-Merged-Stats-Data.git';

interface RawHeroStats {
  id: string;
  key: string;
  hero_id: string;
  appear_rate_percent: string;
  appear_rate_bzc: number;
  forbid_rate_percent: string;
  forbid_rate_bzc: number;
  win_rate_percent: string;
  win_rate_bzc: number;
  strength: number;
  strength_level: number;
}

interface RawStatsFile {
  date: string;
  data: Record<string, Record<string, RawHeroStats[]>>;
}

const RANK_MAP: Record<string, Rank> = {
  all: 'all',
  diamond_plus: 'diamond',
  master_plus: 'master_plus',
  challenger_plus: 'challenger',
  super_server: 'super_server'
};

const LANE_MAP: Record<string, Lane> = {
  mid: 'mid',
  jungle: 'jungle',
  top: 'top',
  support: 'support',
  ad: 'bot'
};

function transformStats(
  raw: RawStatsFile
): (typeof championStats.$inferInsert)[] {
  const statsAt = new Date(raw.date);
  const rows: (typeof championStats.$inferInsert)[] = [];

  for (const [rawRank, laneData] of Object.entries(raw.data)) {
    const rank = RANK_MAP[rawRank];
    if (!rank) continue;

    for (const [rawLane, heroes] of Object.entries(laneData)) {
      const lane = LANE_MAP[rawLane];
      if (!lane) continue;

      for (const h of heroes) {
        rows.push({
          championId: h.id,
          rank,
          lane,
          pickRate: h.appear_rate_percent,
          pickRateBzc: h.appear_rate_bzc,
          banRate: h.forbid_rate_percent,
          banRateBzc: h.forbid_rate_bzc,
          winRate: h.win_rate_percent,
          winRateBzc: h.win_rate_bzc,
          strength: h.strength,
          strengthLevel: h.strength_level,
          statsAt
        });
      }
    }
  }

  return rows;
}

export async function seedStats(): Promise<void> {
  console.log('Seeding stats (cloning repo)...');

  const tmpDir = mkdtempSync(join(tmpdir(), 'wr-stats-seed-'));

  try {
    execSync(`git clone --branch gh-pages --quiet ${STATS_REPO} ${tmpDir}`);
    console.log('  Repository cloned.');

    const shaList = execSync(`git -C ${tmpDir} log --format=%H --reverse`, {
      encoding: 'utf-8'
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    console.log(`  Processing ${shaList.length} commits...`);

    const CHUNK = 500;
    let totalRows = 0;
    let skipped = 0;

    for (let i = 0; i < shaList.length; i++) {
      const sha = shaList[i];

      let rawJson: string;
      try {
        rawJson = execSync(`git -C ${tmpDir} show ${sha}:heroStats.json`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch {
        skipped++;
        continue;
      }

      let rawData: RawStatsFile;
      try {
        rawData = JSON.parse(rawJson) as RawStatsFile;
      } catch {
        skipped++;
        continue;
      }

      const rows = transformStats(rawData);
      if (rows.length === 0) continue;

      for (let j = 0; j < rows.length; j += CHUNK) {
        await db
          .insert(championStats)
          .values(rows.slice(j, j + CHUNK))
          .onConflictDoUpdate({
            target: [
              championStats.championId,
              championStats.rank,
              championStats.lane,
              championStats.statsAt
            ],
            set: {
              pickRate: sql`excluded.pick_rate`,
              pickRateBzc: sql`excluded.pick_rate_bzc`,
              banRate: sql`excluded.ban_rate`,
              banRateBzc: sql`excluded.ban_rate_bzc`,
              winRate: sql`excluded.win_rate`,
              winRateBzc: sql`excluded.win_rate_bzc`,
              strength: sql`excluded.strength`,
              strengthLevel: sql`excluded.strength_level`
            }
          });
      }

      totalRows += rows.length;
      if ((i + 1) % 10 === 0 || i + 1 === shaList.length) {
        console.log(
          `  [${i + 1}/${shaList.length}] ${new Date(rawData.date).toISOString().slice(0, 10)} — ${rows.length} rows`
        );
      }
    }

    console.log(
      `Stats seeded: ${totalRows} rows inserted (${skipped} commits skipped).`
    );
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

// Run standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  seedStats()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
