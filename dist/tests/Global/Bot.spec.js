"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
require("reflect-metadata");
const ts_mockito_1 = require("ts-mockito");
const Global_1 = require("../../src/dependecy/Global");
const Inversify_config_1 = require("../../src/dependecy/Inversify.config");
const FreyaClient_1 = require("../../src/_structure/FreyaClient");
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
    it('should not be null', async () => {
        chai_1.assert.property(discordInstance.folders, 'commands');
    });
});
//# sourceMappingURL=Bot.spec.js.map