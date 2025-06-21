import { Context, Markup } from "telegraf";
import i18n from "../i18n/i18n";
import { getLastMessageId, setLastMessageId } from "../sessions/message.session";

export class MainMenuService {
    static async showMenu(ctx: Context, lang: string): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка показать меню без userId");
            return;
        }

        if (!lang || !['en', 'ru', 'kz'].includes(lang)) {
            console.warn(`Неподдерживаемый язык: ${lang}, используем ru`);
            lang = 'ru';
        }

        try {
            const t = i18n.getFixedT(lang);
            
            // Удаляем предыдущее сообщение если есть
            const prevMsgId = getLastMessageId(userId);
            console.debug(`MainMenuService: userId=${userId}, prevMsgId=${prevMsgId}`);
            
            if (prevMsgId) {
                try {
                    console.debug(`MainMenuService: удаляем сообщение ${prevMsgId}`);
                    await ctx.deleteMessage(prevMsgId);
                    console.debug(`MainMenuService: сообщение ${prevMsgId} удалено`);
                } catch (deleteError) {
                    console.debug(`Не удалось удалить предыдущее сообщение ${prevMsgId}:`, deleteError);
                }
            }

            const msg = await ctx.reply(
                t("start_message"),
                Markup.inlineKeyboard([
                    [Markup.button.callback(t("faq"), "MENU_FAQ")],
                    [Markup.button.callback(t("checklist"), "MENU_CHECKLIST")],
                    [Markup.button.callback(t("calendar"), "MENU_CALENDAR")],
                    [Markup.button.callback(t("contacts"), "MENU_CONTACTS")],
                    [Markup.button.callback("⚙️ " + t("settings"), "OPEN_SETTINGS")],
                ])
            );

            console.debug(`MainMenuService: сохранен ID сообщения ${msg.message_id} для пользователя ${userId}`);
            setLastMessageId(userId, msg.message_id);
            
        } catch (error) {
            console.error(`Ошибка при показе главного меню для пользователя ${userId}:`, error);
            throw error;
        }
    }
}
