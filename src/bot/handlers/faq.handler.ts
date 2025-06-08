import {Context, Markup} from "telegraf";
import {Handler} from "./handler.class";

export class FaqHandler extends Handler {
  handle(): void {
    this.bot.action("MENU_FAQ", async (ctx: Context) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        "📚 *Часто задаваемые вопросы*\n\nВыберите интересующую категорию, чтобы получить ответы на популярные вопросы о поступлении в Astana IT University:",
        Markup.inlineKeyboard([
          [Markup.button.callback("🎓 Поступление", "FAQ_ADMISSION")],
          [Markup.button.callback("🔙 Назад в главное меню", "MENU_BACK")],
        ])
      );
    });

    this.bot.action("FAQ_ADMISSION", async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        "Вопросы по поступлению:\n1. Как подать документы?\n2. Какие экзамены нужно сдавать?"
      );
    });

    this.bot.action("MENU_BACK", async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        "Главное меню:",
        Markup.inlineKeyboard([
          [Markup.button.callback("📖 FAQ", "MENU_FAQ")],
          [Markup.button.callback("📋 Чек-лист документов", "MENU_CHECKLIST")],
          [Markup.button.callback("🗓 Календарь дедлайнов", "MENU_CALENDAR")],
          [Markup.button.callback("🔔 Напоминания", "MENU_REMINDERS")],
          [Markup.button.callback("📍 Контакты и геолокация", "MENU_CONTACTS")],
        ])
      );
    });

    console.log("FAQHandler: обработчики зарегистрированы");
  }
}
