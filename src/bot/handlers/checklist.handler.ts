import { Context, Markup } from "telegraf";
import {Handler} from "./handler.class";
import {getUserLanguage} from "../sessions/language.session";
import i18n from "../i18n/i18n";
import {sendCleanMessage} from "../../utils/message.utils";

export class ChecklistHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_CHECKLIST", this.showChecklist.bind(this));
    }

    private async showChecklist(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка показать чек-лист без userId");
            return;
        }

        try {
            // Принудительно удаляем сообщение с главным меню
            if (ctx.callbackQuery?.message?.message_id) {
                try {
                    console.debug(`ChecklistHandler: удаляем сообщение главного меню ${ctx.callbackQuery.message.message_id}`);
                    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
                    console.debug(`ChecklistHandler: сообщение главного меню удалено`);
                } catch (deleteError) {
                    console.debug(`Не удалось удалить сообщение главного меню:`, deleteError);
                }
            }

            const lang = getUserLanguage(userId) || "ru";
            const t = i18n.getFixedT(lang);

            const message = `
📋 <b>${t("checklist_title")}</b>

📎 ${t("checklist_item_id")}
📎 ${t("checklist_item_diploma")}
📎 ${t("checklist_item_ent")}
📎 ${t("checklist_item_benefits")}
📎 ${t("checklist_item_ielts")}

📝 <i>${t("checklist_footer")}</i>
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
            console.error(`Ошибка при показе чек-листа для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при показе чек-листа");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }
}
