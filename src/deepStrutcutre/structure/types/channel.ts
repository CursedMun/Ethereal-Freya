
import { disambiguation } from "../util";
import { Channel, Util } from "discord.js";
import ArgumentType from "./base";
import { FreyaClient } from "../FreyaClient";
import { FreyaMessage } from "../extensions/message";
import { Argument } from "../commands/argument";

export default class ChannelArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'channel');
	}

	validate(val:string, msg:FreyaMessage, arg:Argument) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.cache.has(matches[1]);
		const search = val.toLowerCase();
		let channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
		if(channels.size === 0) return false;
		if(channels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false;
			return true;
		}
		const exactChannels = channels.filter(nameFilterExact(search));
		if(exactChannels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false;
			return true;
		}
		if(exactChannels.size > 0) channels = exactChannels;
		return channels.size <= 15 ?
			`${disambiguation(channels.map(chan => Util.escapeMarkdown(chan.name)), 'channels', null)}\n` :
			'Multiple channels found. Please be more specific.';
	}

	parse(val:string, msg:FreyaMessage) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.cache.get(matches[1]) || null;
		const search = val.toLowerCase();
		const channels = msg.guild.channels.cache.filter(nameFilterInexact(search));
		if(channels.size === 0) return null;
		if(channels.size === 1) return channels.first();
		const exactChannels = channels.filter(nameFilterExact(search));
		if(exactChannels.size === 1) return exactChannels.first();
		return null;
	}
}

function nameFilterExact(search:string) {
	return (chann: Channel) => chann.name.toLowerCase() === search;
}

function nameFilterInexact(search:string) {
	return (chann: Channel) => chann.name.toLowerCase().includes(search);
}