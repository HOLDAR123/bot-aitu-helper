import {getLastMessageId, setLastMessageId} from "../bot/sessions/message.session";
import {Context} from "telegraf";

export async function sendCleanMessage(
    ctx: Context,
    userId: number,
    text: string,
    keyboard?: any,
    useHtml: boolean = false
) {
    const lastMsgId = getLastMessageId(userId);
    if (lastMsgId) {
        try {
            await ctx.deleteMessage(lastMsgId);
        } catch {}
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
    setLastMessageId(userId, sentMsg.message_id);
}
