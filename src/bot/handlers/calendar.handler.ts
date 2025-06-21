import { Context, Markup } from "telegraf";
import { Handler } from "./handler.class";
import { sendCleanMessage } from "../../utils/message.utils";
import {getUserLanguage} from "../sessions/language.session";
import i18n from "../i18n/i18n";

export class CalendarHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_CALENDAR", this.showCalendar.bind(this));
    }

    private async showCalendar(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка показать календарь без userId");
            return;
        }

        try {
            // Принудительно удаляем сообщение с главным меню
            if (ctx.callbackQuery?.message?.message_id) {
                try {
                    console.debug(`CalendarHandler: удаляем сообщение главного меню ${ctx.callbackQuery.message.message_id}`);
                    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
                    console.debug(`CalendarHandler: сообщение главного меню удалено`);
                } catch (deleteError) {
                    console.debug(`Не удалось удалить сообщение главного меню:`, deleteError);
                }
            }

            const lang = getUserLanguage(userId) || "ru";
            const t = i18n.getFixedT(lang);

            const message = `
📅 <b>${t("calendar_title")}</b>

📌 <b>${t("calendar_grant_application")}:</b>
🗓 ${t("calendar_grant_dates")}

📌 <b>${t("calendar_exam")}:</b>
🗓 ${t("calendar_exam_deadline")}
(<i>${t("calendar_exam_note")}</i>)

📌 <b>${t("calendar_courses")}:</b>
🗓 ${t("calendar_courses_deadline")}

📌 <b>${t("calendar_docs")}:</b>
🗓 ${t("calendar_docs_deadline")}
`.trim();

            await sendCleanMessage(
                ctx,
                userId,
                message,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t("back"), "MENU_BACK")]
                ]),
                true
            );

            await ctx.answerCbQuery();
            
        } catch (error) {
            console.error(`Ошибка при показе календаря для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при показе календаря");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }
}
