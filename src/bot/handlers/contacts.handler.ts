import { Context, Markup } from "telegraf";
import { Handler } from "./handler.class";
import { getUserLanguage } from "../sessions/language.session";
import i18n from "../i18n/i18n";
import { sendCleanMessage } from "../../utils/message.utils";

export class ContactsHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_CONTACTS", this.showContacts.bind(this));
    }

    private async showContacts(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        try {
            if (ctx.callbackQuery?.message?.message_id) {
                await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
            }
        } catch {}

        const lang = getUserLanguage(userId) || "ru";
        const t = i18n.getFixedT(lang);

        const message = `
<b>${t("contacts_university")}</b>

<b>${t("contacts_call_center")}:</b>
<a href="tel:+77172645714">${t("contacts_phone_main")}</a>

<b>${t("contacts_location")}:</b>
${t("contacts_address")}
`.trim();

        const buttons = Markup.inlineKeyboard([
            [Markup.button.url(t("button_whatsapp_chat"), "https://wa.me/77713256171")],
            [Markup.button.url(t("contacts_map_link_text"), "https://go.2gis.com/jXnyF")],
            [
                Markup.button.url(t("button_website"), "https://astanait.edu.kz"),
                Markup.button.url(t("button_telegram"), "https://t.me/aitu2020info"),
                Markup.button.url(t("button_instagram"), "https://www.instagram.com/astana_it_university/")
            ],
            [Markup.button.callback(t("back"), "MENU_BACK")]
        ]);

        await sendCleanMessage(ctx, userId, message, buttons, true);

        await ctx.answerCbQuery();
    }
}
