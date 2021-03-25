import { FreyaClient } from "../FreyaClient";

export class GuildSettingsHelper {
  private Guild: FreyaGuild;
  private Client: FreyaClient;
	/**
	 * @param {CommandoClient} client - Client to use the provider of
	 * @param {?CommandoGuild} guild - Guild the settings are for
	 * @private
	 */
	constructor(client: FreyaClient, guild:FreyaGuild) {
		/**
		 * Client to use the provider of
		 * @name GuildSettingsHelper#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Guild the settings are for
		 * @type {?CommandoGuild}
		 */
		this.Guild = guild;
	}

	/**
	 * Gets a setting in the guild
	 * @param {string} key - Name of the setting
	 * @param {*} [defVal] - Value to default to if the setting isn't set
	 * @return {*}
	 * @see {@link SettingProvider#get}
	 */
	get(key, defVal) {
		if(!this.Client.provider) throw new Error('No settings provider is available.');
		return this.Client.provider.get(this.Guild, key, defVal);
	}

	/**
	 * Sets a setting for the guild
	 * @param {string} key - Name of the setting
	 * @param {*} val - Value of the setting
	 * @return {Promise<*>} New value of the setting
	 * @see {@link SettingProvider#set}
	 */
	set(key, val) {
		if(!this.Client.provider) throw new Error('No settings provider is available.');
		return this.Client.provider.set(this.Guild, key, val);
	}

	/**
	 * Removes a setting from the guild
	 * @param {string} key - Name of the setting
	 * @return {Promise<*>} Old value of the setting
	 * @see {@link SettingProvider#remove}
	 */
	remove(key) {
		if(!this.Client.provider) throw new Error('No settings provider is available.');
		return this.Client.provider.remove(this.Guild, key);
	}

	/**
	 * Removes all settings in the guild
	 * @return {Promise<void>}
	 * @see {@link SettingProvider#clear}
	 */
	clear() {
		if(!this.Client.provider) throw new Error('No settings provider is available.');
		return this.Client.provider.clear(this.Guild);
	}
}