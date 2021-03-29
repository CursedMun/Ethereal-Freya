import { FreyaMessage } from "../extensions/message";
import { FreyaClient } from "../FreyaClient";
import ArgumentType from "./base";

export default class MessageArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'message');
	}

	async validate(val:string, msg:FreyaMessage) {
		if(!/^[0-9]+$/.test(val)) return false;
		return Boolean(await msg.channel.messages.fetch(val).catch(() => null));
	}

	parse(val:string, msg:FreyaMessage) {
		return msg.channel.messages.cache.get(val);
	}
}