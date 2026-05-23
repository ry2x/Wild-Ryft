import 'dotenv/config';

import { closeDb } from '../index.js';
import { seedChampions } from './champion.js';
import { seedStats } from './stats.js';

console.log('=== Wild Ryft DB Seed ===');

await seedChampions();
await seedStats();

console.log('=== Seed complete ===');
await closeDb();
