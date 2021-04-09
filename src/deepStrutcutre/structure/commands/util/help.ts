import { FreyaMessage } from "../../extensions/message";
import { FreyaClient } from "../../FreyaClient";
import { disambiguation } from "../../util";
import {oneLine, stripIndents} from 'common-tags'
import { Command } from "../base";

module.exports = class HelpCommand extends Command {
	constructor(Client: FreyaClient) {
		super(Client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg: FreyaMessage, args: any): Promise<any> {
		const groups = msg.Client.Registry.Groups;
		const commands = msg.Client.Registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].Name}**:__ ${commands[0].Description}
						${commands[0].GuildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].Nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].Name}${commands[0].Format ? ` ${commands[0].Format}` : ''}`,null)}
				`;
				if(commands[0].Aliases.length > 0) help += `\n**Aliases:** ${commands[0].Aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].Group!.name}
					(\`${commands[0].GroupID}:${commands[0].MemberName}\`)
				`}`;
				if(commands[0].Details) help += `\n**Details:** ${commands[0].Details}`;
				if(commands[0].Examples) help += `\n**Examples:**\n${commands[0].Examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help,{}));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
				} catch(err) {
					messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use ${msg.usage(
						"", msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${oneLine`
						To run a command in ${msg.guild ? msg.guild.name : 'any server'},
						use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : undefined, this.Client.user)}.
						For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : undefined, this.Client.user)}.
					`}
					To run a command in this DM, simply use ${Command.usage('command', "", null)} with no prefix.

					Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
					Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.

					__**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.Name}:** ${cmd.Description}${cmd.Nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
			} catch(err) {
				messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
			}
			return messages;
		}
	}
};
