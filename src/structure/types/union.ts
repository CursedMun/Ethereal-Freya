import { ArgumentType } from "./base";
/**
 * A type for command arguments that handles multiple other types
 * @extends {ArgumentType}
 */
export class ArgumentUnionType extends ArgumentType {
  Types: ArgumentType[];
	constructor(client, id) {
		super(client, id);

		/**
		 * Types to handle, in order of priority
		 * @type {ArgumentType[]}
		 */
		this.Types = [];
		const typeIDs = id.split('|');
		for(const typeID of typeIDs) {
			const type = client.registry.types.get(typeID);
			if(!type) throw new Error(`Argument type "${typeID}" is not registered.`);
			this.Types.push(type);
		}
	}

	async validate(val, msg, arg) {
		let results = this.Types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
		results = await Promise.all(results);
		if(results.some(valid => valid && typeof valid !== 'string')) return true;
		const errors = results.filter(valid => typeof valid === 'string');
		if(errors.length > 0) return errors.join('\n');
		return false;
	}

	async parse(val, msg, arg) {
		let results = this.Types.map(type => !type.isEmpty(val, msg, arg) && type.validate(val, msg, arg));
		results = await Promise.all(results);
		for(let i = 0; i < results.length; i++) {
			if(results[i] && typeof results[i] !== 'string') return this.Types[i].parse(val, msg, arg);
		}
		throw new Error(`Couldn't parse value "${val}" with union type ${this.id}.`);
	}

	isEmpty(val, msg, arg) {
		return !this.Types.some(type => !type.isEmpty(val, msg, arg));
	}
}