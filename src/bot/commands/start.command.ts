import { Command } from "./command.class";
import { Telegraf } from "telegraf";
import { StartHandler } from "../handlers/start.handler";

export class StartCommand extends Command {
    constructor(bot: Telegraf) {
        super(bot);
    }

    handle(): void {
        new StartHandler(this.bot).handle();
        console.log("Команда /start и обработчики зарегистрированы");
    }
}
