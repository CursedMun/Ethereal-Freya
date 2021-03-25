import { ArgumentType } from "./base";
import { disambiguation } from "../util";
import { Util } from "discord.js";

export class GroupArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'group');
	}

	validate(val:string) {
		const groups = this.Client.Registry.findGroups(val);
		if(groups.length === 1) return true;
		if(groups.length === 0) return false;
		return groups.length <= 15 ?
			`${disambiguation(groups.map(grp => Util.escapeMarkdown(grp.name)), 'groups', null)}\n` :
			'Multiple groups found. Please be more specific.';
	}

	parse(val:string) {
		return this.Client.Registry.findGroups(val)[0];
	}
}