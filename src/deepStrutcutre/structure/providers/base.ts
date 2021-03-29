import { Guild } from "discord.js";
import { FreyaClient } from "../FreyaClient";

export abstract class SettingProvider {
    constructor() {
        if (this.constructor.name === 'SettingProvider') throw new Error('The base SettingProvider cannot be instantiated.');
    }

    init(client: FreyaClient) { throw new Error(`${this.constructor.name} doesn't have an init method.`); }
    destroy() { throw new Error(`${this.constructor.name} doesn't have a destroy method.`); }
    get(guild: Guild| string, key: string, defVal: any) { throw new Error(`${this.constructor.name} doesn't have a get method.`); }
    set(guild: Guild|string, key: string, val: any): Promise<any> { throw new Error(`${this.constructor.name} doesn't have a set method.`); }
    remove(guild: Guild | string, key: string): Promise<any> { throw new Error(`${this.constructor.name} doesn't have a remove method.`); }

    /**
     * Removes all settings in a guild
     * @param {Guild|string} guild - Guild to clear the settings of
     * @return {Promise<void>}
     * @abstract
     */
    clear(guild: Guild | string): Promise<void> { throw new Error(`${this.constructor.name} doesn't have a clear method.`); }

    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid
     * @param {Guild|string} guild - Guild to get the ID of
     * @return {string} ID of the guild, or 'global'
     */
    static getGuildID(guild: Guild | string): string {
        if (guild instanceof Guild) return guild.id;
        if (guild === 'global' || guild === null) return 'global';
        if (typeof guild === 'string') return guild;
        throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
    }
}
