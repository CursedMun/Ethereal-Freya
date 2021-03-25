import { ArgumentType } from "./base";
export class MessageArgumentType extends ArgumentType {
	constructor(client) {
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