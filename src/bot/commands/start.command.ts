import { Command } from "./command.class";
import { Telegraf } from "telegraf";

export class StartCommand extends Command {
    constructor(bot: Telegraf) {
        super(bot);
    }

    handle(): void {
        // Просто регистрируем команду /start, логика обработки в StartHandler
        console.log("✅ Команда /start зарегистрирована");
    }
}
