import { Context } from "telegraf";
import { Handler } from "./handler.class";
import {getUserLanguage} from "../sessions/language.session";
import {MainMenuService} from "../services/mainMenu.service";

export class BackHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_BACK", this.backToMainMenu.bind(this));
    }

    private async backToMainMenu(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        try {
            if (ctx.callbackQuery?.message?.message_id) {
                await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
            }
        } catch {}

        const lang = getUserLanguage(userId) || "ru";
        await MainMenuService.showMenu(ctx, lang);

        await ctx.answerCbQuery();
    }
}
