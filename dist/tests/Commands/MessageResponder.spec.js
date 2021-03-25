"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("mocha");
const chai_1 = require("chai");
const ts_mockito_1 = require("ts-mockito");
const discord_js_1 = require("discord.js");
const Regex_service_1 = require("../../src/services/Regex-service");
const Message_responder_1 = require("../../src/services/Message-responder");
describe('MessageResponder', () => {
    let mockedPingFinderClass;
    let mockedPingFinderInstance;
    let mockedMessageClass;
    let mockedMessageInstance;
    let service;
    beforeEach(() => {
        mockedPingFinderClass = ts_mockito_1.mock(Regex_service_1.RegexService);
        mockedPingFinderInstance = ts_mockito_1.instance(mockedPingFinderClass);
        mockedMessageClass = ts_mockito_1.mock(discord_js_1.Message);
        mockedMessageInstance = ts_mockito_1.instance(mockedMessageClass);
        setMessageContents();
        service = new Message_responder_1.MessageResponder(mockedPingFinderInstance);
    });
    it('should reply', async () => {
        whenIsPingThenReturn(true);
        await service.handle(mockedMessageInstance);
        ts_mockito_1.verify(mockedMessageClass.reply('pong!')).once();
    });
    it('should not reply', async () => {
        whenIsPingThenReturn(false);
        await service.handle(mockedMessageInstance).then(() => {
            // Successful promise is unexpected, so we fail the test
            chai_1.expect.fail('Unexpected promise');
        }).catch(() => {
            // Rejected promise is expected, so nothing happens here
        });
        ts_mockito_1.verify(mockedMessageClass.reply('pong!')).never();
    });
    function setMessageContents() {
        mockedMessageInstance.content = "Non-empty string";
    }
    function whenIsPingThenReturn(result) {
        ts_mockito_1.when(mockedPingFinderClass.isPing("Non-empty string")).thenReturn(result);
    }
});
//# sourceMappingURL=MessageResponder.spec.js.map