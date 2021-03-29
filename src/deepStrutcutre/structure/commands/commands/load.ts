
import { FreyaMessage } from "../../extensions/message";
import { FreyaClient } from "../../FreyaClient";
import { Command } from '../base';

module.exports = class LoadCommandCommand extends Command {
	constructor(Client) {
		super(Client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'commands',
			memberName: 'load',
			description: 'Loads a new command.',
			details: oneLine`
				The argument must be full name of the command in the format of \`group:memberName\`.
				Only the bot owner(s) may use this command.
			`,
			examples: ['load some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to load?',
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.Client.registry.findCommands(val).length > 0) {
							return resolve('That command is already registered.');
						}
						const cmdPath = this.Client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: val => {
						const split = val.split(':');
						const cmdPath = this.Client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
				}
			]
		});
	}

	async run(msg, args) {
		this.Client.registry.registerCommand(args.command);
		const command = this.Client.registry.commands.last();

		if(this.Client.shard) {
			try {
				await this.Client.shard.broadcastEval(`
					const ids = [${this.Client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
						delete require.cache[cmdPath];
						this.registry.registerCommand(require(cmdPath));
					}
				`);
			} catch(err) {
				this.Client.emit('warn', `Error when broadcasting command load to other shards`);
				this.Client.emit('error', err);
				await msg.reply(`Loaded \`${command.name}\` command, but failed to load on other shards.`);
				return null;
			}
		}

		await msg.reply(`Loaded \`${command.name}\` command${this.Client.shard ? ' on all shards' : ''}.`);
		return null;
	}
};
