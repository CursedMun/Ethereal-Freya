require('dotenv').config();
import { Container } from "inversify";
import "reflect-metadata";
import { FreyaClient } from "../deepStrutcutre/structure/FreyaClient";
import { MessageResponder } from "../services/Message-responder";
import { RegexService } from "../services/Regex-service";
import { Client } from "./Client";
import { Global } from "./Global";
let container = new Container();
container.bind<Client>(Global.Client).to(Client).inSingletonScope();
container.bind<string>(Global.Token).toConstantValue(process.env.TOKEN!);
container.bind<FreyaClient>(Global.FreyaClient).toConstantValue(new FreyaClient({
    commandPrefix: "!",
    owner: "423946555872116758",
}));
container.bind<MessageResponder>(Global.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<RegexService>(Global.RegexService).to(RegexService).inSingletonScope();
export default container;