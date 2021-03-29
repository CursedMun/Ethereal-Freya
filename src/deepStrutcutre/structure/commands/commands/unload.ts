
import { FreyaMessage } from "../../extensions/message";
import { FreyaClient } from "../../FreyaClient";
import { Command } from '../base';


module.exports = class UnloadCommandCommand extends Command {
	constructor(Client: FreyaClient) {
		super(Client, {
			name: 'unload',
			aliases: ['unload-command'],
			group: 'commands',
			memberName: 'unload',
			description: 'Unloads a command.',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command.
				Only the bot owner(s) may use this command.
			`,
			examples: ['unload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to unload?',
					type: 'command'
				}
			]
		});
	}

	async run(msg: FreyaMessage, args) {
		args.command.unload();

		if(this.Client.shard) {
			try {
				await this.Client.shard.broadcastEval(`
					const ids = [${this.Client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						this.registry.commands.get('${args.command.name}').unload();
					}
				`);
			} catch(err) {
				this.Client.emit('warn', `Error when broadcasting command unload to other shards`);
				this.Client.emit('error', err);
				await msg.reply(`Unloaded \`${args.command.name}\` command, but failed to unload on other shards.`);
				return null;
			}
		}

		await msg.reply(`Unloaded \`${args.command.name}\` command${this.Client.shard ? ' on all shards' : ''}.`);
		return null;
	}
};
