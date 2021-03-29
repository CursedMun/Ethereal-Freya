"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const inversify_1 = require("inversify");
const path = require("path");
const Global_1 = require("./Global");
let Client = class Client {
    constructor(client, token, messageResponder) {
        this.Client = client;
        this.token = token;
        this.messageResponder = messageResponder;
    }
    startUp() {
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
};
Client = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(Global_1.Global.FreyaClient)),
    __param(1, inversify_1.inject(Global_1.Global.Token)),
    __param(2, inversify_1.inject(Global_1.Global.MessageResponder))
], Client);
exports.Client = Client;
//# sourceMappingURL=Client.js.map