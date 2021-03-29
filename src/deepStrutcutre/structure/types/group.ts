
import { Util } from "discord.js";
import { CommandGroup } from "../commands/group";
import { FreyaClient } from "../FreyaClient";
import { disambiguation } from "../util";
import ArgumentType from "./base";

export default class GroupArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'group');
	}

	validate(val: string) {
		const groups = this.Client.Registry.findGroups(val);
		if (groups.length === 1) return true;
		if (groups.length === 0) return false;
		return groups.length <= 15 ?
			`${disambiguation(groups.map((grp: CommandGroup) => Util.escapeMarkdown(grp.name)), 'groups')}\n` :
			'Multiple groups found. Please be more specific.';
	}

	parse(val: string) {
		return this.Client.Registry.findGroups(val)[0];
	}
}