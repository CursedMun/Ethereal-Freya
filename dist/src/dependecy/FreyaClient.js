"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const inversify_1 = require("inversify");
const Logger_1 = require("../helpers/Logger");
const Command_handler_1 = require("../services/Command-handler");
const Message_responder_1 = require("../services/Message-responder");
const FreyaClient_1 = require("../_structure/FreyaClient");
const Global_1 = require("./Global");
let Bot = class Bot {
    constructor(client, token, messageResponder) {
        this.client = client;
        this.token = token;
        this.messageResponder = messageResponder;
    }
    startUp() {
        Command_handler_1.CommandHandler(this);
        this.client.on('message', (message) => {
            if (message.author.bot) {
                Logger_1.Logger.log('Ignoring bot message!');
                return;
            }
            console.log(this.client);
            Logger_1.Logger.log(`Message received! Contents: ${message.content}`);
            this.messageResponder.handle(message).then(() => {
                Logger_1.Logger.log("Response sent!");
            }).catch(() => {
                Logger_1.Logger.log("Response not sent.");
            });
        });
        return this.client.login(this.token);
    }
};
Bot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(Global_1.Global.FreyaClient)),
    __param(1, inversify_1.inject(Global_1.Global.Token)),
    __param(2, inversify_1.inject(Global_1.Global.MessageResponder)),
    __metadata("design:paramtypes", [typeof (_a = typeof FreyaClient_1.FreyaClient !== "undefined" && FreyaClient_1.FreyaClient) === "function" ? _a : Object, String, Message_responder_1.MessageResponder])
], Bot);
exports.Bot = Bot;
//# sourceMappingURL=FreyaClient.js.map