"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class MessageArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'message');
    }
    async validate(val, msg) {
        if (!/^[0-9]+$/.test(val))
            return false;
        return Boolean(await msg.channel.messages.fetch(val).catch(() => null));
    }
    parse(val, msg) {
        return msg.channel.messages.cache.get(val);
    }
}
exports.default = MessageArgumentType;
//# sourceMappingURL=message.js.map