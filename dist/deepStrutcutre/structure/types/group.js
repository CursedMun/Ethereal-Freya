"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = require("../util");
const base_1 = require("./base");
class GroupArgumentType extends base_1.default {
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
            `${util_1.disambiguation(groups.map((grp) => discord_js_1.Util.escapeMarkdown(grp.name)), 'groups')}\n` :
            'Multiple groups found. Please be more specific.';
    }
    parse(val) {
        return this.Client.Registry.findGroups(val)[0];
    }
}
exports.default = GroupArgumentType;
//# sourceMappingURL=group.js.map