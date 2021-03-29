import { Argument } from "../commands/argument";
import { FreyaMessage } from "../extensions/message";
import { FreyaClient } from "../FreyaClient";
import ArgumentType from "./base";
export default class StringArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'string');
	}

	validate(val: string, msg: FreyaMessage, arg: Argument) {
		if (arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
			return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
		}
		if (arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
			return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`;
		}
		if (arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
			return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`;
		}
		return true;
	}

	parse(val: string) {
		return val;
	}
}