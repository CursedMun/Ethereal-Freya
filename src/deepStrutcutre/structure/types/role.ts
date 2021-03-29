import { disambiguation } from "../util";
import { Role, Util } from "discord.js";
import ArgumentType from "./base";
import { FreyaClient } from "../FreyaClient";
import { Argument } from "../commands/argument";
import { FreyaMessage } from "../extensions/message";
export default class RoleArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'role');
	}

	validate(val:string, msg:FreyaMessage, arg:Argument) {
		const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
		if(matches) return msg.guild.roles.cache.has(matches[1]);
		const search = val.toLowerCase();
		let roles = msg.guild.roles.cache.filter(nameFilterInexact(search));
		if(roles.size === 0) return false;
		if(roles.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(roles.first().id)) return false;
			return true;
		}
		const exactRoles = roles.filter(nameFilterExact(search));
		if(exactRoles.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactRoles.first().id)) return false;
			return true;
		}
		if(exactRoles.size > 0) roles = exactRoles;
		return roles.size <= 15 ?
			`${disambiguation(roles.map(role => `${Util.escapeMarkdown(role.name)}`), 'roles', null)}\n` :
			'Multiple roles found. Please be more specific.';
	}

	parse(val:string, msg:FreyaMessage) {
		const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
		if(matches) return msg.guild.roles.cache.get(matches[1]) || null;
		const search = val.toLowerCase();
		const roles = msg.guild.roles.cache.filter(nameFilterInexact(search));
		if(roles.size === 0) return null;
		if(roles.size === 1) return roles.first();
		const exactRoles = roles.filter(nameFilterExact(search));
		if(exactRoles.size === 1) return exactRoles.first();
		return null;
	}
}

function nameFilterExact(search:string) {
	return (role:Role) => role.name.toLowerCase() === search;
}

function nameFilterInexact(search:string) {
	return (role:Role) => role.name.toLowerCase().includes(search);
}