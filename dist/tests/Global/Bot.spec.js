"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("mocha");
const ts_mockito_1 = require("ts-mockito");
const Inversify_config_1 = require("../../src/dependecy/Inversify.config");
const Global_1 = require("../../src/dependecy/Global");
const FreyaClient_1 = require("../../src/structure/FreyaClient");
const chai_1 = require("chai");
describe('Bot', () => {
    let discordMock;
    let discordInstance;
    let bot;
    beforeEach(() => {
        discordMock = ts_mockito_1.mock(FreyaClient_1.FreyaClient);
        discordInstance = ts_mockito_1.instance(discordMock);
        Inversify_config_1.default.rebind(Global_1.Global.FreyaClient)
            .toConstantValue(discordInstance);
        bot = Inversify_config_1.default.get(Global_1.Global.Bot);
    });
    // Test cases here
    it('should not be null', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(discordInstance);
        chai_1.assert.property(discordInstance.folders, 'commands');
    }));
});
//# sourceMappingURL=Bot.spec.js.map