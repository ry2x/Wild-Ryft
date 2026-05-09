import 'dotenv/config';
import {
  SapphireClient,
  ApplicationCommandRegistries,
  RegisterBehavior
} from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { createLogger } from '@wild-ryft/logger';

const logger = createLogger({
  name: 'bot',
  level: process.env.LOG_LEVEL,
  bindings: { app: 'discord-bot' }
});

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite
);

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  loadMessageCommandListeners: true
});

const main = async () => {
  logger.info('Starting Discord bot');

  try {
    await client.login(process.env.DISCORD_TOKEN);
    logger.info('Discord bot login succeeded');
  } catch (error) {
    logger.error('Discord bot login failed', { error });
    await client.destroy();
    process.exit(1);
  }
};

void main();
