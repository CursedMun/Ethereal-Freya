"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildSettingsHelper = void 0;
class GuildSettingsHelper {
    constructor(Client, guild) {
        this.Client = Client;
        this.guild = guild;
    }
    get(key, defVal) {
        if (!this.Client.provider)
            throw new Error('No settings provider is available.');
        return this.Client.provider.get(this.guild, key, defVal);
    }
    set(key, val) {
        if (!this.Client.provider)
            throw new Error('No settings provider is available.');
        return this.Client.provider.set(this.guild, key, val);
    }
    remove(key) {
        if (!this.Client.provider)
            throw new Error('No settings provider is available.');
        return this.Client.provider.remove(this.guild, key);
    }
    clear() {
        if (!this.Client.provider)
            throw new Error('No settings provider is available.');
        return this.Client.provider.clear(this.guild);
    }
}
exports.GuildSettingsHelper = GuildSettingsHelper;
//# sourceMappingURL=helper.js.map