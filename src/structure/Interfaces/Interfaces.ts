import { ClientOptions, PermissionResolvable } from "discord.js";

export interface FreyaClientOptions extends ClientOptions {
	commandPrefix?: string;
	commandEditableDuration?: number;
	nonCommandEditable?: boolean;
	owner?: string | string[] | Set<string>;
	invite?: string;
}
export interface CommandInfo {
	name: string;
	aliases?: Array<string>;
	autoAliases?: boolean;
	group: string;
	memberName: string;
	description: string;
	format?: string;
	details?: string;
	examples?: string[];
	nsfw?: boolean;
	guildOnly?: boolean;
	ownerOnly?: boolean;
	clientPermissions?: PermissionResolvable[];
	userPermissions?: PermissionResolvable[];
	defaultHandling?: boolean;
	throttling?: ThrottlingOptions;
	args?: ArgumentInfo[];
	argsPromptLimit?: number;
	argsType?: string;
	argsCount?: number;
	argsSingleQuotes?: boolean;
	patterns?: RegExp[];
	guarded?: boolean;
	hidden?: boolean;
	unknown?: boolean;
}
export interface ThrottlingOptions {
	usages: number;
	duration: number;
}
type ArgumentDefault = any | Function;
export interface ArgumentInfo {
	key: string;
	label?: string;
	prompt: string;
	error?: string;
	type?: string;
	max?: number;
	min?: number;
	oneOf?: string[];
	default?: ArgumentDefault;
	infinite?: boolean;
	validate?: Function;
	parse?: Function;
	isEmpty?: Function;
	wait?: number;
}