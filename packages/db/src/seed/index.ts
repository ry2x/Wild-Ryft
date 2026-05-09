import 'dotenv/config';
import { seedChampions } from './champion.js';
import { seedStats } from './stats.js';
import { closeDb } from '../index.js';

console.log('=== Wild Ryft DB Seed ===');

await seedChampions();
await seedStats();

console.log('=== Seed complete ===');
await closeDb();
