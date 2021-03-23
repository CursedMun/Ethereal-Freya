"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("mocha");
const chai_1 = require("chai");
const Regex_service_1 = require("../../src/services/Regex-service");
describe('PingFinder', () => {
    let service;
    beforeEach(() => {
        service = new Regex_service_1.RegexService();
    });
    it('should find "ping" in the string', () => {
        chai_1.expect(service.isPing("ping")).to.be.true;
    });
});
//# sourceMappingURL=Pinger.spec.js.map