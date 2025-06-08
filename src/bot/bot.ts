
import { Command } from './commands/command.class';
import { Context, session, Telegraf } from 'telegraf';
import {IConfigService} from "../config/config.interface";
import {Handler} from "./handlers/handler.class";

export class Bot {
  private readonly bot: Telegraf<Context>;
  private commands: Command[] = [];
  private handlers: Handler[] = [];

  constructor(private readonly configService: IConfigService) {
    const token = this.configService.get('BOT_TOKEN');
    this.bot = new Telegraf<Context>(token);
    this.bot.use(session());
  }

  public registerCommands(commands: Command[]): void {
    this.commands = commands;
    for (const command of this.commands) {
      command.handle();
    }
    console.log(`Зарегистрировано команд: ${this.commands.length}`);
  }

  public registerHandlers(handlers: Handler[]): void {
    this.handlers = handlers
    for(const handler of this.handlers) {
      handler.handle()
    }
    console.log(`Зарегистрировано handler-ов: ${this.handlers.length}`);
  }

  public async init(): Promise<void> {
    console.log('Инициализация бота...');

    this.bot.catch((err, ctx) => {
      console.error(`Ошибка в обработчике для ${ctx.updateType}:`, err);
    });

    await this.bot.telegram.deleteWebhook();

    console.log('Запуск бота...');
    await this.bot.launch();
    console.log('Бот запущен успешно');
  }

  /** Доступ к экземпляру Telegraf для команд */
  public get instance(): Telegraf<Context> {
    return this.bot;
  }
}
