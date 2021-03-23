import { Client, Collection, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { Logger } from "../helpers/Logger";
import { CommandHandler } from "../services/Command-handler";
import { MessageResponder } from "../services/Message-responder";
import { FreyaClient } from "../structure/FreyaClient";
import { Global } from "./Global";
@injectable()
export class Bot {
  private client: FreyaClient;
  private readonly token: string;
  private messageResponder: MessageResponder;
  private commands: Collection<string, object>;
  public events;
  constructor(
    @inject(Global.FreyaClient) client: FreyaClient,
    @inject(Global.Token) token: string,
    @inject(Global.MessageResponder) messageResponder: MessageResponder,
  ) {
    this.client = client;
    this.token = token;
    this.messageResponder = messageResponder;
  }

  public startUp(): Promise<string> {
    CommandHandler(this)
    this.client.on('message', (message: Message) => {
      if (message.author.bot) {
        Logger.log('Ignoring bot message!')
        return;
      }
      console.log(this.client)
      Logger.log(`Message received! Contents: ${message.content}`);

      this.messageResponder.handle(message).then(() => {
        Logger.log("Response sent!");
      }).catch(() => {
        Logger.log("Response not sent.")
      })
    });

    return this.client.login(this.token);
  }

}