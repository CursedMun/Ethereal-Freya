import { Collection, GuildResolvable } from "discord.js";
import { FreyaClient } from "../FreyaClient";
import { Command } from "./base";

export class CommandGroup {
    public id: string;
    public name: string;
    public commands: Collection<string, Command>;
    public guarded: boolean;
    public _globalEnabled: boolean;
    readonly Client: FreyaClient;
    /**
     * @param {CommandoClient} client - The client the group is for
     * @param {string} id - The ID for the group
     * @param {string} [name=id] - The name of the group
     * @param {boolean} [guarded=false] - Whether the group should be protected from disabling
     */
    constructor(client: FreyaClient, id: string, name: string, guarded: boolean = false) {
        if (!client) throw new Error('A client must be specified.');
        if (typeof id !== 'string') throw new TypeError('Group ID must be a string.');
        if (id !== id.toLowerCase()) throw new Error('Group ID must be lowercase.');
        this.Client = client;
        this.id = id;
        this.name = name || id;
        this.commands = new Collection();
        this.guarded = guarded;
        this._globalEnabled = true;
    }

    /**
     * Enables or disables the group in a guild
     * @param {?GuildResolvable} guild - Guild to enable/disable the group in
     * @param {boolean} enabled - Whether the group should be enabled or disabled
     */
    setEnabledIn(guild: GuildResolvable | null, enabled: boolean) {
        if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        if (this.guarded) throw new Error('The group is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            this.Client.emit('groupStatusChange', null, this, enabled);
            return;
        }
        guild = this.Client.guilds.resolve(guild);
        guild?.setGroupEnabled(this, enabled);
    }

    /**
     * Checks if the group is enabled in a guild
     * @param {?GuildResolvable} guild - Guild to check in
     * @return {boolean} Whether or not the group is enabled
     */
    isEnabledIn(guild: GuildResolvable | null): boolean {
        if (this.guarded) return true;
        if (!guild) return this._globalEnabled;
        guild = this.Client.guilds.resolve(guild);
        return guild?.isGroupEnabled(this);
    }

    /**
     * Reloads all of the group's commands
     */
    reload() {
        for (const command of this.commands.values()) command.reload();
    }
}