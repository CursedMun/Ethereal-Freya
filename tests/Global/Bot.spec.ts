import { assert } from "chai";
import 'mocha';
import "reflect-metadata";
import { instance, mock } from "ts-mockito";
import { Bot } from "../../src/dependecy/FreyaClient";
import { Global } from "../../src/dependecy/Global";
import container from "../../src/dependecy/Inversify.config";
import { FreyaClient } from "../../src/structure/FreyaClient";

describe('Bot', () => {
    let discordMock: FreyaClient;
    let discordInstance: FreyaClient;
    let bot: Bot;

    beforeEach(() => {
        discordMock = mock(FreyaClient);
        discordInstance = instance(discordMock);
        container.rebind<FreyaClient>(Global.FreyaClient)
            .toConstantValue(discordInstance);
        bot = container.get<Bot>(Global.Bot);
    });
    // Test cases here
    it('should not be null', async () => {
        assert.property(discordInstance.folders, 'commands')
    })
});