import { ArgumentType } from "./base";
import { disambiguation } from "../util";
import { Util } from "discord.js";

export class CommandArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command');
	}

	validate(val:string) {
		const commands = this.Client.Registry.findCommands(val);
		if(commands.length === 1) return true;
		if(commands.length === 0) return false;
		return commands.length <= 15 ?
			`${disambiguation(commands.map(cmd => Util.escapeMarkdown(cmd.name)), 'commands', null)}\n` :
			'Multiple commands found. Please be more specific.';
	}

	parse(val) {
		return this.Client.Registry.findCommands(val)[0];
	}
}