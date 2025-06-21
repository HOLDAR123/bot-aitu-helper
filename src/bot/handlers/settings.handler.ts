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

    private async openSettingsMenu(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка открыть настройки без userId");
            return;
        }

        try {
            // Принудительно удаляем сообщение с главным меню
            if (ctx.callbackQuery?.message?.message_id) {
                try {
                    console.debug(`SettingsHandler: удаляем сообщение главного меню ${ctx.callbackQuery.message.message_id}`);
                    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
                    console.debug(`SettingsHandler: сообщение главного меню удалено`);
                } catch (deleteError) {
                    console.debug(`Не удалось удалить сообщение главного меню:`, deleteError);
                }
            }

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
            
        } catch (error) {
            console.error(`Ошибка при открытии настроек для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при открытии настроек");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }

    private async setLanguage(ctx: Context & { match?: RegExpExecArray }): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка установить язык без userId");
            return;
        }

        try {
            const lang = ctx.match?.[1];
            if (!lang || !['en', 'ru', 'kz'].includes(lang)) {
                console.warn(`Неподдерживаемый язык: ${lang}`);
                await ctx.answerCbQuery("Неподдерживаемый язык");
                return;
            }

            setUserLanguage(userId, lang);
            await ctx.answerCbQuery();

            const t = i18n.getFixedT(lang);
            await sendCleanMessage(ctx, userId, t("language_selected"));

            await MainMenuService.showMenu(ctx, lang);
            
        } catch (error) {
            console.error(`Ошибка при установке языка для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при установке языка");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }
}
