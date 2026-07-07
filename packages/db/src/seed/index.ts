import 'dotenv/config';

import { closeDb } from '../index.js';
import { seedChampions } from './champion.js';
import { seedScoreSnapshots } from './score.js';
import { seedStats } from './stats.js';

console.log('=== Wild Ryft DB Seed ===');

await seedChampions();
await seedStats();
await seedScoreSnapshots();

console.log('=== Seed complete ===');
await closeDb();
