import { Message } from "discord.js";
import { Argument } from "../commands/argument";
import { FreyaMessage } from "../extensions/message";
import { FreyaClient } from "../FreyaClient";

/** A type for command arguments */
export default class ArgumentType {
  readonly Client:FreyaClient;
  public id: string;
	constructor(client: FreyaClient, id: string) {
		if(!client) throw new Error('A client must be specified.');
		if(typeof id !== 'string') throw new Error('Argument type ID must be a string.');
		if(id !== id.toLowerCase()) throw new Error('Argument type ID must be lowercase.');
    this.Client =client;
		this.id = id;
	}
	validate(val:string, originalMsg:FreyaMessage | Message, arg:Argument, currentMsg:FreyaMessage | Message = originalMsg):boolean|string|Promise<boolean|string> { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a validate() method.`);
	}

	parse(val:string, originalMsg:FreyaMessage | Message, arg:Argument, currentMsg: FreyaMessage | Message = originalMsg): any|Promise<any> { 
		throw new Error(`${this.constructor.name} doesn't have a parse() method.`);
	}

	isEmpty(val: string, originalMsg: FreyaMessage | Message, arg:Argument, currentMsg:FreyaMessage | Message = originalMsg):boolean {
		if(Array.isArray(val)) return val.length === 0;
		return !val;
	}
}