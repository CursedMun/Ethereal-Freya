"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const inversify_1 = require("inversify");
require("reflect-metadata");
const FreyaClient_1 = require("../deepStrutcutre/structure/FreyaClient");
const Message_responder_1 = require("../services/Message-responder");
const Regex_service_1 = require("../services/Regex-service");
const Client_1 = require("./Client");
const Global_1 = require("./Global");
let container = new inversify_1.Container();
container.bind(Global_1.Global.Client).to(Client_1.Client).inSingletonScope();
container.bind(Global_1.Global.Token).toConstantValue(process.env.TOKEN);
container.bind(Global_1.Global.FreyaClient).toConstantValue(new FreyaClient_1.FreyaClient({
    commandPrefix: "!",
    owner: "423946555872116758",
}));
container.bind(Global_1.Global.MessageResponder).to(Message_responder_1.MessageResponder).inSingletonScope();
container.bind(Global_1.Global.RegexService).to(Regex_service_1.RegexService).inSingletonScope();
exports.default = container;
//# sourceMappingURL=Inversify.config.js.map