import "reflect-metadata";
import 'mocha';
import { expect } from 'chai';
import { RegexService } from "../../src/services/Regex-service";

describe('PingFinder', () => {
    let service: RegexService;
    beforeEach(() => {
        service = new RegexService();
    })

    it('should find "ping" in the string', () => {
        expect(service.isPing("ping")).to.be.true
    })
});