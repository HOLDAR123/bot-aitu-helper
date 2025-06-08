import { Context, Markup } from "telegraf";
import i18n from "../i18n/i18n";
import { getLastMessageId, setLastMessageId } from "../sessions/message.session";

export class MainMenuService {
    static async showMenu(ctx: Context, lang: string) {
        const t = i18n.getFixedT(lang);
        const userId = ctx.from?.id;
        if (!userId) return;

        const prevMsgId = getLastMessageId(userId);
        if (prevMsgId) {
            try {
                await ctx.deleteMessage(prevMsgId);
            } catch {}
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

        setLastMessageId(userId, msg.message_id);
    }
}
