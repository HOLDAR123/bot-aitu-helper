import { ConfigService } from './config/config.service';
import { StartCommand } from "./bot/commands/start.command";
import { Bot } from "./bot/bot";
import { initI18n } from "./bot/i18n/i18n";
import {SettingsHandler} from "./bot/handlers/settings.handler";
import {StartHandler} from "./bot/handlers/start.handler";
import {CalendarHandler} from "./bot/handlers/calendar.handler";
import {BackHandler} from "./bot/handlers/back.handler";
import {ChecklistHandler} from "./bot/handlers/checklist.handler";
import {ContactsHandler} from "./bot/handlers/contacts.handler";
import {FaqHandler} from "./bot/handlers/faq.handler";

async function bootstrap() {
  // 🔹 Шаг 1: Инициализируем i18n
  await initI18n();

  const configService = new ConfigService();
  const bot = new Bot(configService);

  // 🔹 Регистрируем команды
  bot.registerCommands([
    new StartCommand(bot.instance),
  ]);

  // 🔹 Регистрируем хендлеры
  bot.registerHandlers([
      new SettingsHandler(bot.instance),
      new StartHandler(bot.instance),
      new CalendarHandler(bot.instance),
      new BackHandler(bot.instance),
      new ChecklistHandler(bot.instance),
      new ContactsHandler(bot.instance),
      new FaqHandler(bot.instance),
  ]);

  // 🔹 Запускаем бота
  await bot.init();
}

bootstrap();
