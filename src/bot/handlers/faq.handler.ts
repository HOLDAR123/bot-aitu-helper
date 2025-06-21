import { Context, Markup } from "telegraf";
import { Handler } from "./handler.class";
import { getUserLanguage } from "../sessions/language.session";
import { getLastMessageId, setLastMessageId } from "../sessions/message.session";
import i18n from "../i18n/i18n";
import {OpenaiService} from "../services/openai.service";
import { sendCleanMessage } from "../../utils/message.utils";

const awaitingUserInput = new Set<number>();
const promptMessages = new Map<number, number>();

export class FaqHandler extends Handler {
    private openaiService: OpenaiService;

    constructor(botInstance: any) {
        super(botInstance);
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("OPENAI_API_KEY не найден в переменных окружения");
        }
        this.openaiService = new OpenaiService(apiKey || "");
    }

    handle(): void {
        this.bot.action("MENU_FAQ", this.askQuestion.bind(this));
        this.bot.action("MENU_BACK", this.handleBack.bind(this));
        this.bot.on("text", this.handleText.bind(this));
    }

    private async askQuestion(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка задать вопрос без userId");
            return;
        }

        try {
            // Принудительно удаляем сообщение с главным меню
            if (ctx.callbackQuery?.message?.message_id) {
                try {
                    console.debug(`FaqHandler: удаляем сообщение главного меню ${ctx.callbackQuery.message.message_id}`);
                    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
                    console.debug(`FaqHandler: сообщение главного меню удалено`);
                } catch (deleteError) {
                    console.debug(`Не удалось удалить сообщение главного меню:`, deleteError);
                }
            }

            const lang = getUserLanguage(userId) || "ru";
            const t = i18n.getFixedT(lang);

            awaitingUserInput.add(userId);

            // Отправляем новое сообщение
            const sentMessage = await ctx.reply(
                t("faq_enter_question"),
                Markup.inlineKeyboard([
                    [Markup.button.callback(t("back"), "MENU_BACK")]
                ])
            );

            // Сохраняем ID нового сообщения
            setLastMessageId(userId, sentMessage.message_id);
            promptMessages.set(userId, sentMessage.message_id);
            
            console.debug(`FaqHandler: отправлено сообщение ${sentMessage.message_id} для пользователя ${userId}`);
            
            await ctx.answerCbQuery();
            
        } catch (error) {
            console.error(`Ошибка при запросе вопроса для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при запросе вопроса");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }

    private async handleBack(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Попытка вернуться назад без userId");
            return;
        }

        try {
            // Очищаем состояние ожидания ввода
            awaitingUserInput.delete(userId);
            
            // Очищаем приглашение если есть
            await this.clearPromptMessage(userId);
            
            await ctx.answerCbQuery();
            
            // Возвращаемся в главное меню
            const lang = getUserLanguage(userId) || "ru";
            const { MainMenuService } = await import("../services/mainMenu.service");
            await MainMenuService.showMenu(ctx, lang);
            
        } catch (error) {
            console.error(`Ошибка при возврате назад для пользователя ${userId}:`, error);
            try {
                await ctx.answerCbQuery("Произошла ошибка при возврате");
            } catch (cbError) {
                console.error("Не удалось ответить на callback query:", cbError);
            }
        }
    }

    private async handleText(ctx: Context): Promise<void> {
        const userId = ctx.from?.id;
        if (!userId) {
            console.warn("Получен текст без userId");
            return;
        }

        if (!awaitingUserInput.has(userId)) return;
        if (!ctx.message || !("text" in ctx.message)) return;

        try {
            const userMessageId = ctx.message.message_id;
            const query = ctx.message.text;

            // Валидация входящего текста
            if (!query || query.trim().length === 0) {
                await ctx.reply("Пожалуйста, введите ваш вопрос.");
                return;
            }

            if (query.length > 1000) {
                await ctx.reply("Вопрос слишком длинный. Пожалуйста, сократите его до 1000 символов.");
                return;
            }

            // Очищаем приглашение и сообщение пользователя
            await this.clearPromptMessage(userId);
            await this.deleteMessage(userId, userMessageId);

            awaitingUserInput.delete(userId);

            const lang = getUserLanguage(userId) || "ru";
            const t = i18n.getFixedT(lang);

            // Показываем индикатор загрузки
            const loadingMsg = await ctx.reply("🤔 Ищу ответ...");

            // Получаем ответ от ИИ
            const answer = await this.openaiService.getAnswer(query);

            // Удаляем индикатор загрузки
            try {
                await ctx.deleteMessage(loadingMsg.message_id);
            } catch {}

            const response = `${t("faq_found_answer")}\n\n${answer}`;

            // Используем sendCleanMessage для автоматического удаления предыдущего сообщения
            await sendCleanMessage(
                ctx,
                userId,
                response,
                Markup.inlineKeyboard([
                    [Markup.button.callback(t("faq_ask_again"), "MENU_FAQ")],
                    [Markup.button.callback(t("back"), "MENU_BACK")]
                ])
            );
            
        } catch (error) {
            console.error(`Ошибка при обработке текста для пользователя ${userId}:`, error);
            awaitingUserInput.delete(userId);
            await this.clearPromptMessage(userId);
            
            try {
                await ctx.reply("Произошла ошибка при обработке вашего вопроса. Попробуйте позже.");
            } catch (replyError) {
                console.error("Не удалось отправить сообщение об ошибке:", replyError);
            }
        }
    }

    private async clearPromptMessage(userId: number): Promise<void> {
        const promptMessageId = promptMessages.get(userId);
        if (promptMessageId) {
            await this.deleteMessage(userId, promptMessageId);
            promptMessages.delete(userId);
        }
    }

    private async deleteMessage(userId: number, messageId: number): Promise<void> {
        try {
            await this.bot.telegram.deleteMessage(userId, messageId);
        } catch (error) {
            console.debug(`Не удалось удалить сообщение ${messageId}:`, error);
        }
    }
}
