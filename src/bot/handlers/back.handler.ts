import { Context } from "telegraf";
import { Handler } from "./handler.class";
import {getUserLanguage} from "../sessions/language.session";
import {MainMenuService} from "../services/mainMenu.service";

export class BackHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_BACK", this.backToMainMenu.bind(this));
    }

    private async backToMainMenu(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка вернуться в главное меню без userId");
            return;
        }

        try {
            // Удаляем текущее сообщение с кнопкой
            if (ctx.callbackQuery?.message?.message_id) {
                try {
                    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
                } catch (deleteError) {
                    console.debug(`Не удалось удалить сообщение ${ctx.callbackQuery.message.message_id}:`, deleteError);
                }
            }

            const lang = getUserLanguage(userId) || "ru";
            await MainMenuService.showMenu(ctx, lang);

            await ctx.answerCbQuery();
            
        } catch (error) {
            console.error(`Ошибка при возврате в главное меню для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при возврате в главное меню");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }
}
