import 'dotenv/config';
import { seedChampions } from './champion.js';
import { seedStats } from './stats.js';

console.log('=== Wild Ryft DB Seed ===');

await seedChampions();
await seedStats();

console.log('=== Seed complete ===');
process.exit(0);
