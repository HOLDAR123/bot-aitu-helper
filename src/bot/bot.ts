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
    if (!token) {
      throw new Error('BOT_TOKEN is required in environment variables');
    }
    
    this.bot = new Telegraf<Context>(token);
    this.bot.use(session());
    
    // Улучшенная обработка ошибок
    this.bot.catch((err, ctx) => {
      console.error(`Ошибка в обработчике для ${ctx.updateType}:`, err);
      
      // Отправляем пользователю сообщение об ошибке
      try {
        ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь к администратору.');
      } catch (replyError) {
        console.error('Не удалось отправить сообщение об ошибке:', replyError);
      }
    });
  }

  public registerCommands(commands: Command[]): void {
    this.commands = commands;
    for (const command of this.commands) {
      try {
        command.handle();
      } catch (error) {
        console.error(`Ошибка при регистрации команды ${command.constructor.name}:`, error);
      }
    }
    console.log(`✅ Зарегистрировано команд: ${this.commands.length}`);
  }

  public registerHandlers(handlers: Handler[]): void {
    this.handlers = handlers;
    for(const handler of this.handlers) {
      try {
        handler.handle();
      } catch (error) {
        console.error(`Ошибка при регистрации обработчика ${handler.constructor.name}:`, error);
      }
    }
    console.log(`✅ Зарегистрировано handler-ов: ${this.handlers.length}`);
  }

  public async init(): Promise<void> {
    console.log('🚀 Инициализация бота...');

    try {
      await this.bot.telegram.deleteWebhook();
      console.log('✅ Webhook удален');

      // Настройка graceful shutdown
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));

      console.log('🚀 Запуск бота...');
      await this.bot.launch();
      console.log('✅ Бот запущен успешно');
      
      // Информация о боте
      const botInfo = await this.bot.telegram.getMe();
      console.log(`🤖 Бот @${botInfo.username} готов к работе`);
      
    } catch (error) {
      console.error('❌ Ошибка при запуске бота:', error);
      throw error;
    }
  }

  public async stop(signal: string): Promise<void> {
    console.log(`\n🛑 Получен сигнал ${signal}, останавливаем бота...`);
    try {
      await this.bot.stop(signal);
      console.log('✅ Бот остановлен');
      process.exit(0);
    } catch (error) {
      console.error('❌ Ошибка при остановке бота:', error);
      process.exit(1);
    }
  }

  /** Доступ к экземпляру Telegraf для команд */
  public get instance(): Telegraf<Context> {
    return this.bot;
  }
}
