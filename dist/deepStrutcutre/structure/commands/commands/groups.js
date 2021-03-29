"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../base");
module.exports = class ListGroupsCommand extends base_1.Command {
    constructor(Client) {
        super(Client, {
            name: 'groups',
            aliases: ['list-groups', 'show-groups'],
            group: 'commands',
            memberName: 'groups',
            description: 'Lists all command groups.',
            details: 'Only administrators may use this command.',
            guarded: true
        });
    }
    hasPermission(msg) {
        if (!msg.guild)
            return this.Client.isOwner(msg.author);
        return msg.member.hasPermission('ADMINISTRATOR') || this.Client.isOwner(msg.author);
    }
    run(msg) {
        return msg.reply(stripIndents `
			__**Groups**__
			${this.Client.registry.groups.map(grp => `**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? 'Enabled' : 'Disabled'}`).join('\n')}
		`);
    }
};
//# sourceMappingURL=groups.js.map