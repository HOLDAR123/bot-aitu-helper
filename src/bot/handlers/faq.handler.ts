import { Context, Markup } from "telegraf";
import { Handler } from "./handler.class";
import { getUserLanguage } from "../sessions/language.session";
import i18n from "../i18n/i18n";
import { searchFaq } from "../../utils/faq.utils";
import { clearLastMessage, getLastMessageId, setLastMessageId } from "../sessions/message.session";

const awaitingUserInput = new Set<number>();

// Храним id сообщения с просьбой ввести вопрос, чтобы потом удалить
const lastFaqMessageIds = new Map<number, number>();

export class FaqHandler extends Handler {
    handle(): void {
        this.bot.action("MENU_FAQ", this.askQuestion.bind(this));
        this.bot.action("MENU_BACK", this.handleBack.bind(this));
        this.bot.on("text", this.handleText.bind(this));
    }

    private async askQuestion(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        // Удаляем предыдущее сообщение пользователя (если есть)
        const lastMessageId = getLastMessageId(userId);
        if (lastMessageId) {
            try {
                await ctx.telegram.deleteMessage(userId, lastMessageId);
            } catch {
                // Игнорируем ошибку, например, если сообщение уже удалено
            }
            clearLastMessage(userId);
        }

        const lang = getUserLanguage(userId) || "ru";
        const t = i18n.getFixedT(lang);

        awaitingUserInput.add(userId);

        const sentMessage = await ctx.reply(t("faq_enter_question"), Markup.inlineKeyboard([
            [Markup.button.callback(t("back"), "MENU_BACK")]
        ]));

        // Сохраняем id сообщения с просьбой ввести вопрос
        lastFaqMessageIds.set(userId, sentMessage.message_id);

        await ctx.answerCbQuery();
    }

    private async handleBack(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        // Удаляем сообщение пользователя (если есть)
        const lastMessageId = getLastMessageId(userId);
        if (lastMessageId) {
            try {
                await ctx.telegram.deleteMessage(userId, lastMessageId);
            } catch {}
            clearLastMessage(userId);
        }

        // Также удаляем сообщение с просьбой ввести вопрос, если оно есть
        const faqMessageId = lastFaqMessageIds.get(userId);
        if (faqMessageId) {
            try {
                await ctx.telegram.deleteMessage(userId, faqMessageId);
            } catch {}
            lastFaqMessageIds.delete(userId);
        }

        awaitingUserInput.delete(userId);

        // Можно добавить логику возврата в главное меню здесь

        await ctx.answerCbQuery();
    }

    private async handleText(ctx: Context) {
        const userId = ctx.from?.id;
        if (!userId) return;

        if (!awaitingUserInput.has(userId)) return;

        if (!ctx.message || !("text" in ctx.message)) return;

        setLastMessageId(userId, ctx.message.message_id);

        awaitingUserInput.delete(userId);

        // Удаляем сообщение с просьбой ввести вопрос
        const faqMessageId = lastFaqMessageIds.get(userId);
        if (faqMessageId) {
            try {
                await ctx.telegram.deleteMessage(userId, faqMessageId);
            } catch {}
            lastFaqMessageIds.delete(userId);
        }

        const query = ctx.message.text;
        const lang = getUserLanguage(userId) || "ru";
        const t = i18n.getFixedT(lang);

        const answer = searchFaq(query);
        const response = answer
            ? `${t("faq_found_answer")}\n\n${answer}`
            : `${t("faq_not_found")}`;

        await ctx.reply(response, Markup.inlineKeyboard([
            [Markup.button.callback(t("faq_ask_again"), "MENU_FAQ")],
            [Markup.button.callback(t("back"), "MENU_BACK")]
        ]));
    }
}
