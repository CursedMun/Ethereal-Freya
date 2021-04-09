
import { stripIndents } from "common-tags";
import { Message } from "discord.js";
import { FreyaMessage } from "../../extensions/message";
import { FreyaClient } from "../../FreyaClient";
import { Command } from '../base';


module.exports = class ListGroupsCommand extends Command {
	constructor(Client: FreyaClient) {
		super(Client, {
			name: 'groups',
			aliases: ['list-groups', 'show-groups'],
			group: 'commands',
			memberName: 'groups',
			description: 'Lists all command groups.',
			details: 'Only administrators may use this command.',
			guarded: true
		});
	}

	hasPermission(message: FreyaMessage) {
		if(!message.guild) return this.Client.isOwner(message.author);
		return message.member!.hasPermission('ADMINISTRATOR') || this.Client.isOwner(message.author);
	}

	run(msg: FreyaMessage) {
		return msg.reply(stripIndents`
			__**Groups**__
			${this.Client.Registry.Groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Enabled' : 'Disabled'}`
			).join('\n')}
		`);
	}
};
