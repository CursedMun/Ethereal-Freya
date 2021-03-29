
import { disambiguation } from "../util";
import { Util } from "discord.js";
import { FreyaClient } from "../FreyaClient";
import ArgumentType from "./base";
import { Command } from "../commands/base";

export default class CommandArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'command');
	}

	validate(val:string) {
		const commands = this.Client.Registry.findCommands(val);
		if(commands.length === 1) return true;
		if(commands.length === 0) return false;
		return commands.length <= 15 ?
			`${disambiguation(commands.map((cmd: Command) => Util.escapeMarkdown(cmd.Name)), 'commands')}\n` :
			'Multiple commands found. Please be more specific.';
	}

	parse(val: string) {
		return this.Client.Registry.findCommands(val)[0];
	}
}