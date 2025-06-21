import {getLastMessageId, setLastMessageId} from "../bot/sessions/message.session";
import {Context} from "telegraf";

export async function sendCleanMessage(
    ctx: Context,
    userId: number,
    text: string,
    keyboard?: any,
    useHtml: boolean = false
): Promise<void> {
    if (!text || text.trim().length === 0) {
        console.warn("Попытка отправить пустое сообщение");
        return;
    }

    try {
        const lastMsgId = getLastMessageId(userId);
        console.debug(`sendCleanMessage: userId=${userId}, lastMsgId=${lastMsgId}`);
        
        if (lastMsgId) {
            try {
                console.debug(`Пытаемся удалить сообщение ${lastMsgId} для пользователя ${userId}`);
                await ctx.deleteMessage(lastMsgId);
                console.debug(`✅ Сообщение ${lastMsgId} успешно удалено`);
            } catch (deleteError) {
                console.debug(`❌ Не удалось удалить предыдущее сообщение ${lastMsgId}:`, deleteError);
            }
        } else {
            console.debug(`Нет предыдущего сообщения для удаления (userId=${userId})`);
        }

        const options: any = {};

        if (keyboard) {
            if (typeof keyboard === 'object' && 'reply_markup' in keyboard) {
                options.reply_markup = keyboard.reply_markup;
            } else {
                options.reply_markup = keyboard;
            }
        }

        if (useHtml) {
            options.parse_mode = "HTML";
        }

        const sentMsg = await ctx.reply(text, options);
        console.debug(`Отправлено новое сообщение ${sentMsg.message_id} для пользователя ${userId}`);
        setLastMessageId(userId, sentMsg.message_id);
        
    } catch (error) {
        console.error(`Ошибка при отправке сообщения пользователю ${userId}:`, error);
        throw error;
    }
}

export async function deleteMessage(ctx: Context, messageId: number): Promise<boolean> {
    try {
        await ctx.deleteMessage(messageId);
        return true;
    } catch (error) {
        console.debug(`Не удалось удалить сообщение ${messageId}:`, error);
        return false;
    }
}

export async function answerCallbackQuery(ctx: Context, text?: string): Promise<boolean> {
    try {
        await ctx.answerCbQuery(text);
        return true;
    } catch (error) {
        console.debug("Не удалось ответить на callback query:", error);
        return false;
    }
}
