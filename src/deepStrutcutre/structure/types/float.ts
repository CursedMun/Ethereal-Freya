import { Argument } from "../commands/argument";
import { FreyaMessage } from "../extensions/message";
import { FreyaClient } from "../FreyaClient";
import ArgumentType from "./base";

export default class FloatArgumentType extends ArgumentType {
	constructor(client: FreyaClient) {
		super(client, 'float');
	}

	validate(val: string, msg: FreyaMessage, arg: Argument) {
		const float = Number.parseFloat(val);
		if (Number.isNaN(float)) return false;
		if (arg.oneOf && !arg.oneOf.includes(float)) {
			return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
		}
		if (arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
			return `Please enter a number above or exactly ${arg.min}.`;
		}
		if (arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
			return `Please enter a number below or exactly ${arg.max}.`;
		}
		return true;
	}

	parse(val: string) {
		return Number.parseFloat(val);
	}
}