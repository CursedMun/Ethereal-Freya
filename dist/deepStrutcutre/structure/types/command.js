"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
const base_1 = require("./base");
class CommandArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'command');
    }
    validate(val) {
        const commands = this.Client.Registry.findCommands(val);
        if (commands.length === 1)
            return true;
        if (commands.length === 0)
            return false;
        return commands.length <= 15 ?
            `${util_1.disambiguation(commands.map((cmd) => discord_js_1.Util.escapeMarkdown(cmd.Name)), 'commands')}\n` :
            'Multiple commands found. Please be more specific.';
    }
    parse(val) {
        return this.Client.Registry.findCommands(val)[0];
    }
}
exports.default = CommandArgumentType;
//# sourceMappingURL=command.js.map