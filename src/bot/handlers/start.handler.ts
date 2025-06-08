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
        if (!userId) return;

        try {
            if (ctx.message?.message_id) {
                await ctx.deleteMessage(ctx.message.message_id);
            }
        } catch {}

        const lang = getUserLanguage(userId);

        if (!lang) {
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
            return;
        }

        await MainMenuService.showMenu(ctx, lang);
    }
}
