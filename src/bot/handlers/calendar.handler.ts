import { Context, Markup } from "telegraf";
import { Handler } from "./handler.class";
import { sendCleanMessage } from "../../utils/message.utils";
import {getUserLanguage} from "../sessions/language.session";
import i18n from "../i18n/i18n";

export class CalendarHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_CALENDAR", this.showCalendar.bind(this));
    }

    private async showCalendar(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

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
    }
}
