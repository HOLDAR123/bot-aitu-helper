import { ConfigService } from './config/config.service';
import {StartCommand} from "./bot/commands/start.command";
import {Bot} from "./bot/bot";
import {FaqHandler} from "./bot/handlers/faq.handler";

async function bootstrap() {
  const configService = new ConfigService();

  const bot = new Bot(configService);

  bot.registerCommands([
    new StartCommand(bot.instance),
  ]);

  bot.registerHandlers([
    new FaqHandler(bot.instance)
  ])

  await bot.init();
}

bootstrap();
