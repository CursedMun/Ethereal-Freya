import { inject, injectable } from "inversify";
import path = require("path");
import { FreyaClient } from "../deepStrutcutre/structure/FreyaClient";
import { MessageResponder } from "../services/Message-responder";
import { Global } from "./Global";
@injectable()
export class Client {
  private Client: FreyaClient;
  private readonly token: string;
  messageResponder: MessageResponder;
  constructor(
    @inject(Global.FreyaClient) client: FreyaClient,
    @inject(Global.Token) token: string,
    @inject(Global.MessageResponder) messageResponder: MessageResponder,
  ) {
    this.Client = client;
    this.token = token;
    this.messageResponder = messageResponder;
  }

  public startUp(): Promise<string> {
    this.Client.Registry
      .registerDefaultTypes()
      // .registerTypesIn(path.join(__dirname, 'types'))
      .registerGroups([
        ["test", "Test"],
      ])
      .registerDefaultGroups()
      .registerDefaultCommands({
        help: false,
        evaluate: true,
        ping: true,
        prefix: true,
        commandState: true,
        unknownCommand: false
      })
      .registerCommandsIn(path.join(__dirname, 'commands'));
    return this.Client.login(this.token);
  }

}