import { disambiguation } from "../util";
import { Util } from "discord.js";
import { FreyaMessage } from "../extensions/message";
import ArgumentType from "./base";
import { FreyaClient } from "../FreyaClient";

export default class CustomEmojiArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'custom-emoji');
	}

	validate(value:string, msg:FreyaMessage) {
		const matches = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/);
		if(matches && msg.client.emojis.cache.has(matches[2])) return true;
		if(!msg.guild) return false;
		const search = value.toLowerCase();
		let emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
		if(!emojis.size) return false;
		if(emojis.size === 1) return true;
		const exactEmojis = emojis.filter(nameFilterExact(search));
		if(exactEmojis.size === 1) return true;
		if(exactEmojis.size > 0) emojis = exactEmojis;
		return emojis.size <= 15 ?
			`${disambiguation(emojis.map(emoji => Util.escapeMarkdown(emoji.name)), 'emojis')}\n` :
			'Multiple emojis found. Please be more specific.';
	}

	parse(value: string, msg: FreyaMessage) {
		const matches = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/);
		if(matches) return msg.client.emojis.cache.get(matches[2]) || null;
		const search = value.toLowerCase();
		const emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
		if(!emojis.size) return null;
		if(emojis.size === 1) return emojis.first();
		const exactEmojis = emojis.filter(nameFilterExact(search));
		if(exactEmojis.size === 1) return exactEmojis.first();
		return null;
	}
}

function nameFilterExact(search: string) {
	return (emoji: { name: string; }) => emoji.name.toLowerCase() === search;
}

function nameFilterInexact(search: string) {
	return (emoji: { name: string; }) => emoji.name.toLowerCase().includes(search);
}