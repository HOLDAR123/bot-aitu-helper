import { Context, Markup, Telegraf } from "telegraf";
import { Handler } from "./handler.class";
import {getUserLanguage} from "../sessions/language.session";
import {sendCleanMessage} from "../../utils/message.utils";
import {MainMenuService} from "../services/mainMenu.service";

export class StartHandler extends Handler {
    handle(): void {
        this.bot.command("start", this.handleStartCommand.bind(this));
    }

    private async handleStartCommand(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка запуска команды /start без userId");
            return;
        }

        try {
            // Удаляем команду /start если возможно
            if (ctx.message?.message_id) {
                try {
                    await ctx.deleteMessage(ctx.message.message_id);
                } catch (deleteError) {
                    // Игнорируем ошибки удаления сообщения
                    console.debug(`Не удалось удалить сообщение ${ctx.message.message_id}:`, deleteError);
                }
            }

            const lang = getUserLanguage(userId);

            if (!lang) {
                await this.showLanguageSelection(ctx, userId);
                return;
            }

            await MainMenuService.showMenu(ctx, lang);
            
        } catch (error) {
            console.error(`Ошибка в handleStartCommand для пользователя ${userId}:`, error);
            try {
                await ctx.reply("Произошла ошибка при запуске бота. Попробуйте позже.");
            } catch (replyError) {
                console.error("Не удалось отправить сообщение об ошибке:", replyError);
            }
        }
    }

    private async showLanguageSelection(ctx: Context, userId: number): Promise<void> {
        try {
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
        } catch (error) {
            console.error(`Ошибка при показе выбора языка для пользователя ${userId}:`, error);
            throw error;
        }
    }
}
