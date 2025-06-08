import { Context, Markup } from "telegraf";
import { Command } from "./command.class";

export class StartCommand extends Command {
  handle(): void {
    this.bot.command("start", async (ctx: Context) => {
      await ctx.reply(
        "Добро пожаловать в бот Astana IT University! Выберите нужный раздел:",
        Markup.inlineKeyboard([
          [Markup.button.callback("📖 FAQ", "MENU_FAQ")],
          [Markup.button.callback("📋 Чек-лист документов", "MENU_CHECKLIST")],
          [Markup.button.callback("🗓 Календарь дедлайнов", "MENU_CALENDAR")],
          [Markup.button.callback("🔔 Напоминания", "MENU_REMINDERS")],
          [Markup.button.callback("📍 Контакты и геолокация", "MENU_CONTACTS")],
        ])
      );
    });
    console.log("Команда /start зарегистрирована");
  }
}
