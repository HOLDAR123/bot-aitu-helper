import { Context, Telegraf } from "telegraf";

export abstract class Command {
  public constructor(public readonly bot: Telegraf<Context>) {}

  abstract handle(): void;
}
