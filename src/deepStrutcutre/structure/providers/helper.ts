import { FreyaGuild } from "../extensions/guild";
import { FreyaClient } from "../FreyaClient";

export class GuildSettingsHelper {
    readonly Client: FreyaClient;
    guild: FreyaGuild;
    constructor(Client: FreyaClient, guild: FreyaGuild) {
        this.Client = Client;
        this.guild = guild;
    }
    get(key: string, defVal: any): any {
        if (!this.Client.Provider) throw new Error('No settings provider is available.');
        return this.Client.Provider.get(this.guild, key, defVal);
    }
    set(key: string, val: any): Promise<any> {
        if (!this.Client.Provider) throw new Error('No settings provider is available.');
        return this.Client.Provider.set(this.guild, key, val);
    }
    remove(key: string): Promise<any> {
        if (!this.Client.Provider) throw new Error('No settings provider is available.');
        return this.Client.Provider.remove(this.guild, key);
    }
    clear(): Promise<void> {
        if (!this.Client.Provider) throw new Error('No settings provider is available.');
        return this.Client.Provider.clear(this.guild);
    }
}