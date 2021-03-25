"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreyaGuild = void 0;
const discord_js_1 = require("discord.js");
const helper_1 = require("../providers/helper");
class FreyaGuild extends discord_js_1.Guild {
    constructor(Client, args) {
        super(Client, args);
        this.Client = Client;
        this.Settings = new helper_1.GuildSettingsHelper(this.Client, this);
        this._commandPrefix = null;
    }
    get commandPrefix() {
        if (this._commandPrefix === null)
            return this.Client.commandPrefix;
        return this._commandPrefix;
    }
    set commandPrefix(prefix) {
        this._commandPrefix = prefix;
        this.Client.emit("commandPrefixChange", this, this._commandPrefix);
    }
    setCommandEnabled(command, enabled) {
        command = this.Client.Registry.resolveCommand(command);
        if (command.guarded)
            throw new Error("The command is guarded.");
        if (typeof enabled === "undefined")
            throw new TypeError("Enabled must not be undefined.");
        enabled = Boolean(enabled);
        if (!this._commandsEnabled)
            this._commandsEnabled = {};
        this._commandsEnabled[command.name] = enabled;
        this.Client.emit("commandStatusChange", this, command, enabled);
    }
    isCommandEnabled(command) {
        command = this.Client.Registry.resolveCommand(command);
        if (command.guarded)
            return true;
        if (!this._commandsEnabled ||
            typeof this._commandsEnabled[command.name] === "undefined") {
            return command._globalEnabled;
        }
        return this._commandsEnabled[command.name];
    }
    setGroupEnabled(group, enabled) {
        group = this.Client.Registry.resolveGroup(group);
        if (group.guarded)
            throw new Error("The group is guarded.");
        if (typeof enabled === "undefined")
            throw new TypeError("Enabled must not be undefined.");
        enabled = Boolean(enabled);
        if (!this._groupsEnabled)
            this._groupsEnabled = {};
        this._groupsEnabled[group.id] = enabled;
        this.Client.emit("groupStatusChange", this, group, enabled);
    }
    isGroupEnabled(group) {
        group = this.Client.Registry.resolveGroup(group);
        if (group.guarded)
            return true;
        if (!this._groupsEnabled ||
            typeof this._groupsEnabled[group.id] === "undefined")
            return group._globalEnabled;
        return this._groupsEnabled[group.id];
    }
    /**
     * Creates a command usage string using the guild's prefix
     * @param {string} [command] - A command + arg string
     * @param {User} [user=this.Client.user] - User to use for the mention command format
     * @return {string}
     */
    commandUsage(command, user = this.Client.user) {
        return Command.usage(command, this.commandPrefix, user);
    }
}
exports.FreyaGuild = FreyaGuild;
discord_js_1.Structures.extend("Guild", () => FreyaGuild);
//# sourceMappingURL=guild.js.map