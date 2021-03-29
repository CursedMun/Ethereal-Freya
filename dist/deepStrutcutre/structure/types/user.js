"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const discord_js_1 = require("discord.js");
const base_1 = require("./base");
class UserArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'user');
    }
    async validate(val, msg, arg) {
        const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches) {
            try {
                const user = await msg.client.users.fetch(matches[1]);
                if (!user)
                    return false;
                if (arg.oneOf && !arg.oneOf.includes(user.id))
                    return false;
                return true;
            }
            catch (err) {
                return false;
            }
        }
        if (!msg.guild)
            return false;
        const search = val.toLowerCase();
        let members = msg.guild.members.cache.filter(memberFilterInexact(search));
        if (members.size === 0)
            return false;
        if (members.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(members.first().id))
                return false;
            return true;
        }
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1) {
            if (arg.oneOf && !arg.oneOf.includes(exactMembers.first().id))
                return false;
            return true;
        }
        if (exactMembers.size > 0)
            members = exactMembers;
        return members.size <= 15 ?
            `${util_1.disambiguation(members.map(mem => `${discord_js_1.Util.escapeMarkdown(mem.user.username)}#${mem.user.discriminator}`), 'users', null)}\n` :
            'Multiple users found. Please be more specific.';
    }
    parse(val, msg) {
        const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
        if (matches)
            return msg.client.users.cache.get(matches[1]) || null;
        if (!msg.guild)
            return null;
        const search = val.toLowerCase();
        const members = msg.guild.members.cache.filter(memberFilterInexact(search));
        if (members.size === 0)
            return null;
        if (members.size === 1)
            return members.first().user;
        const exactMembers = members.filter(memberFilterExact(search));
        if (exactMembers.size === 1)
            return exactMembers.first().user;
        return null;
    }
}
exports.default = UserArgumentType;
function memberFilterExact(search) {
    return (user) => user.user.username.toLowerCase() === search ||
        (user.nickname && user.nickname.toLowerCase() === search) ||
        `${user.user.username.toLowerCase()}#${user.user.discriminator}` === search;
}
function memberFilterInexact(search) {
    return (user) => user.user.username.toLowerCase().includes(search) ||
        (user.nickname && user.nickname.toLowerCase().includes(search)) ||
        `${user.user.username.toLowerCase()}#${user.user.discriminator}`.includes(search);
}
//# sourceMappingURL=user.js.map