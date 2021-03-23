"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const inversify_1 = require("inversify");
const path_1 = require("path");
require("reflect-metadata");
const Message_responder_1 = require("../services/Message-responder");
const Regex_service_1 = require("../services/Regex-service");
const FreyaClient_1 = require("../structure/FreyaClient");
const FreyaClient_2 = require("./FreyaClient");
const Global_1 = require("./Global");
let container = new inversify_1.Container();
container.bind(Global_1.Global.Bot).to(FreyaClient_2.Bot).inSingletonScope();
container.bind(Global_1.Global.Token).toConstantValue(process.env.TOKEN);
container.bind(Global_1.Global.FreyaClient).toConstantValue(new FreyaClient_1.FreyaClient({
    prefix: "!",
    folders: {
        Events: {
            files: [],
            path: path_1.join(__dirname.substring(0, __dirname.lastIndexOf("\\") + 1), "events")
        },
        Commands: {
            files: [],
            path: path_1.join(__dirname.substring(0, __dirname.lastIndexOf("\\") + 1), "commands")
        }
    }
}, process.env.TOKEN));
container.bind(Global_1.Global.MessageResponder).to(Message_responder_1.MessageResponder).inSingletonScope();
container.bind(Global_1.Global.RegexService).to(Regex_service_1.RegexService).inSingletonScope();
exports.default = container;
//# sourceMappingURL=Inversify.config.js.map