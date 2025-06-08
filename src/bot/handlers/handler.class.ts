import { Context, Telegraf } from "telegraf";

export abstract class Handler {
  public constructor(public readonly bot: Telegraf<Context>) {}

  abstract handle(): void;
}
