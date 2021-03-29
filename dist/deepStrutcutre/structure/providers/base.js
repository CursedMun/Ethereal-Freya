"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingProvider = void 0;
const discord_js_1 = require("discord.js");
class SettingProvider {
    constructor() {
        if (this.constructor.name === 'SettingProvider')
            throw new Error('The base SettingProvider cannot be instantiated.');
    }
    init(client) { throw new Error(`${this.constructor.name} doesn't have an init method.`); }
    destroy() { throw new Error(`${this.constructor.name} doesn't have a destroy method.`); }
    get(guild, key, defVal) { throw new Error(`${this.constructor.name} doesn't have a get method.`); }
    set(guild, key, val) { throw new Error(`${this.constructor.name} doesn't have a set method.`); }
    remove(guild, key) { throw new Error(`${this.constructor.name} doesn't have a remove method.`); }
    /**
     * Removes all settings in a guild
     * @param {Guild|string} guild - Guild to clear the settings of
     * @return {Promise<void>}
     * @abstract
     */
    clear(guild) { throw new Error(`${this.constructor.name} doesn't have a clear method.`); }
    /**
     * Obtains the ID of the provided guild, or throws an error if it isn't valid
     * @param {Guild|string} guild - Guild to get the ID of
     * @return {string} ID of the guild, or 'global'
     */
    static getGuildID(guild) {
        if (guild instanceof discord_js_1.Guild)
            return guild.id;
        if (guild === 'global' || guild === null)
            return 'global';
        if (typeof guild === 'string')
            return guild;
        throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
    }
}
exports.SettingProvider = SettingProvider;
//# sourceMappingURL=base.js.map