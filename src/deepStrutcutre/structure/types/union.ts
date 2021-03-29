import { Argument } from "../commands/argument";
import { FreyaMessage } from "../extensions/message";
import { FreyaClient } from "../FreyaClient";
import ArgumentType from "./base";

export default class ArgumentUnionType extends ArgumentType {
  Types: ArgumentType[];
	constructor(client: FreyaClient, id: string) {
		super(client, id);
		this.Types = [];
		const typeIDs = id.split('|');
		for(const typeID of typeIDs) {
			const type = client.Registry.Types.get(typeID);
			if(!type) throw new Error(`Argument type "${typeID}" is not registered.`);
			this.Types.push(type);
		}
	}

	async validate(val: string, msg: FreyaMessage, arg: Argument) {
		let results = this.Types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
		results = await Promise.all(results);
		if(results.some(valid => valid && typeof valid !== 'string')) return true;
		const errors = results.filter(valid => typeof valid === 'string');
		if(errors.length > 0) return errors.join('\n');
		return false;
	}

	async parse(val: string, msg: FreyaMessage, arg: Argument) {
		let results = this.Types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
		results = await Promise.all(results);
		for(let i = 0; i < results.length; i++) {
			if(results[i] && typeof results[i] !== 'string') return this.Types[i].parse(val, msg, arg);
		}
		throw new Error(`Couldn't parse value "${val}" with union type ${this.id}.`);
	}

	isEmpty(val: string, msg: FreyaMessage, arg: Argument) {
		return !this.Types.some(type => !type.isEmpty(val, msg, arg));
	}
}