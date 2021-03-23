import { Message } from "discord.js";
import { RegexService } from "./Regex-service";
import { inject, injectable } from "inversify";
import { Global } from "../dependecy/Global";

@injectable()
export class MessageResponder {
    private pingFinder: RegexService;

    constructor(
        @inject(Global.RegexService) pingFinder: RegexService
    ) {
        this.pingFinder = pingFinder;
    }

    handle(message: Message): Promise<Message | Message[]> {
        if (this.pingFinder.isPing(message.content)) {
            return message.reply('pong!');
        }

        return Promise.reject();
    }
}