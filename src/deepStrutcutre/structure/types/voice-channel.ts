
import { disambiguation } from "../util";
import { Util, VoiceChannel } from "discord.js";
import ArgumentType from "./base";
import { FreyaClient } from "../FreyaClient";
import { FreyaMessage } from "../extensions/message";
import { Argument } from "../commands/argument";

export default class VoiceChannelArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'voice-channel');
	}

	validate(val: string, msg: FreyaMessage, arg: Argument) {
		const matches = val.match(/^([0-9]+)$/);
		if(matches) {
			try {
				const channel = msg.client.channels.resolve(matches[1]);
				if(!channel || channel.type !== 'voice') return false;
				if(arg.oneOf && !arg.oneOf.includes(channel.id)) return false;
				return true;
			} catch(err) {
				return false;
			}
		}
		if(!msg.guild) return false;
		const search = val.toLowerCase();
		let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
		if(channels.size === 0) return false;
		if(channels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false;
			return true;
		}
		const exactChannels = channels.filter(channelFilterExact(search));
		if(exactChannels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false;
			return true;
		}
		if(exactChannels.size > 0) channels = exactChannels;
		return channels.size <= 15 ?
			`${disambiguation(
				channels.map(chan => Util.escapeMarkdown(chan.name)), 'voice channels', null
			)}\n` :
			'Multiple voice channels found. Please be more specific.';
	}

	parse(val: string, msg: FreyaMessage) {
		const matches = val.match(/^([0-9]+)$/);
		if(matches) return msg.client.channels.cache.get(matches[1]) || null;
		if(!msg.guild) return null;
		const search = val.toLowerCase();
		const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
		if(channels.size === 0) return null;
		if(channels.size === 1) return channels.first();
		const exactChannels = channels.filter(channelFilterExact(search));
		if(exactChannels.size === 1) return exactChannels.first();
		return null;
	}
}

function channelFilterExact(search:string) {
	return (chan: VoiceChannel) => chan.type === 'voice' && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search:string) {
	return (chan: VoiceChannel) => chan.type === 'voice' && chan.name.toLowerCase().includes(search);
}