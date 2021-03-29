"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
module.exports = class PingCommand extends base_1.Command {
    constructor(Client) {
        super(Client, {
            name: 'ping',
            group: 'util',
            memberName: 'ping',
            description: 'Checks the bot\'s ping to the Discord server.',
            throttling: {
                usages: 5,
                duration: 10
            }
        });
    }
    async run(msg) {
        const pingMsg = await msg.reply('Pinging...');
        return pingMsg.edit(oneLine `
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			Pong! The message round-trip took ${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)}ms.
			${this.Client.ws.ping ? `The heartbeat ping is ${Math.round(this.Client.ws.ping)}ms.` : ''}
		`);
    }
};
//# sourceMappingURL=ping.js.map