import { Context, Markup, Telegraf } from "telegraf";
import { Handler } from "./handler.class";
import {getUserLanguage, setUserLanguage} from "../sessions/language.session";
import i18n from "../i18n/i18n";
import {sendCleanMessage} from "../../utils/message.utils";
import {MainMenuService} from "../services/mainMenu.service";


export class SettingsHandler extends Handler {
    handle(): void {
        this.bot.action("OPEN_SETTINGS", this.openSettingsMenu.bind(this));
        this.bot.action(/SET_LANG_(.+)/, this.setLanguage.bind(this));
    }

    private async openSettingsMenu(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        const lang = getUserLanguage(userId) || "ru";
        const t = i18n.getFixedT(lang);

        await sendCleanMessage(
            ctx,
            userId,
            "🌐 Тілді таңдаңыз / Выберите язык / Choose your language:",
            Markup.inlineKeyboard([
                [
                    Markup.button.callback("🇰🇿 Қазақша", "SET_LANG_kz"),
                    Markup.button.callback("🇷🇺 Русский", "SET_LANG_ru"),
                    Markup.button.callback("🇬🇧 English", "SET_LANG_en"),
                ],
            ])
        );

        await ctx.answerCbQuery();
    }

    private async setLanguage(ctx: Context & { match?: RegExpExecArray }) {
        const userId = ctx.from?.id;
        if (!userId) return;

        const lang = ctx.match?.[1];
        if (!lang) return;

        setUserLanguage(userId, lang);
        await ctx.answerCbQuery();

        const t = i18n.getFixedT(lang);
        await sendCleanMessage(ctx, userId, t("language_selected"));

        await MainMenuService.showMenu(ctx, lang);
    }
}
