import { ClientOptions } from "discord.js";

	/**
	 * Options for a CommandoClient
	 * @typedef {ClientOptions} FreyaClientOptions
	 * @property {string} [commandPrefix=!] - Default command prefix
	 * @property {number} [commandEditableDuration=30] - Time in seconds that command messages should be editable
	 * @property {boolean} [nonCommandEditable=true] - Whether messages without commands can be edited to a command
	 */
	export interface CommandoClientOptions extends ClientOptions {
		commandPrefix?: string;
		commandEditableDuration?: number;
		nonCommandEditable?: boolean;
		owner?: string | string[] | Set<string>;
		invite?: string;
	}