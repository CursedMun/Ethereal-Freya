import { FreyaMessage } from "../../extensions/message";
import { FreyaClient } from "../../FreyaClient";

const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(Client: FreyaClient) {
		super(Client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: 'Displays help information for when an unknown command is used.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg:FreyaMessage) {
		return msg.reply(
			`Unknown command. Use ${msg.anyUsage(
				'help',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} to view the command list.`
		);
	}
};
