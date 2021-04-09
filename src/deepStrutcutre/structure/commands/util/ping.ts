import { Message } from 'discord.js';
import { FreyaMessage } from '../../extensions/message';
import { FreyaClient } from '../../FreyaClient';
import { Command } from '../base';
import {oneLine} from 'common-tags'
module.exports = class PingCommand extends Command {
	constructor(Client: FreyaClient) {
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

	async run(msg: FreyaMessage) {
		const pingMsg = await msg.reply('Pinging...') as Message;
		return pingMsg.edit(oneLine`
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			Pong! The message round-trip took ${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
			}ms.
			${this.Client.ws.ping ? `The heartbeat ping is ${Math.round(this.Client.ws.ping)}ms.` : ''}
		`);
	}
};
