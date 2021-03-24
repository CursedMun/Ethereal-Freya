require('dotenv').config();
import { Container } from "inversify";
import { join } from "path";
import "reflect-metadata";
import { MessageResponder } from "../services/Message-responder";
import { RegexService } from "../services/Regex-service";
import { FreyaClient } from "../_structure/FreyaClient";
import { Bot } from "./FreyaClient";
import { Global } from "./Global";
let container = new Container();
container.bind<Bot>(Global.Bot).to(Bot).inSingletonScope();
container.bind<string>(Global.Token).toConstantValue(process.env.TOKEN);
container.bind<FreyaClient>(Global.FreyaClient).toConstantValue(new FreyaClient({
    prefix: "!",
    folders: {
        Events: {
            files: [],
            path: join(__dirname.substring(0, __dirname.lastIndexOf("\\") + 1), "events")
        },
        Commands: {
            files: [],
            path: join(__dirname.substring(0, __dirname.lastIndexOf("\\") + 1), "commands")
        }
    }
}, process.env.TOKEN));
container.bind<MessageResponder>(Global.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<RegexService>(Global.RegexService).to(RegexService).inSingletonScope();
export default container;