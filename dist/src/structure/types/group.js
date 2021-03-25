"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupArgumentType = void 0;
const base_1 = require("./base");
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
class GroupArgumentType extends base_1.ArgumentType {
    constructor(client) {
        super(client, 'group');
    }
    validate(val) {
        const groups = this.Client.Registry.findGroups(val);
        if (groups.length === 1)
            return true;
        if (groups.length === 0)
            return false;
        return groups.length <= 15 ?
            `${util_1.disambiguation(groups.map(grp => discord_js_1.Util.escapeMarkdown(grp.name)), 'groups', null)}\n` :
            'Multiple groups found. Please be more specific.';
    }
    parse(val) {
        return this.Client.Registry.findGroups(val)[0];
    }
}
exports.GroupArgumentType = GroupArgumentType;
//# sourceMappingURL=group.js.map