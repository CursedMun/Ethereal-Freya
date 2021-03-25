import { oneLine, stripIndents } from 'common-tags';
import { GuildResolvable, Message, PermissionResolvable, User, Util } from 'discord.js';
import 'path';
import { FreyaMessage } from '../extensions/message';
import { FreyaClient } from '../FreyaClient';
import { CommandInfo, ThrottlingOptions } from '../Interfaces/Interfaces';
import { permissions } from '../util';
import { ArgumentCollector } from './collector';
import path = require('path');


/** A command that can be run in a client */
export class Command {
    Name: string;
    Aliases: String[];
    GroupID: string;
    Group?: CommandGroup;
    MemberName: string;
    Description: string;
    Format?: string;
    Details?: string;
    Examples?: string[];
    GuildOnly: boolean;
    OwnerOnly: boolean;
    ClientPermissions?: PermissionResolvable[];
    UserPermissions?: PermissionResolvable[];
    Nsfw: boolean;
    DefaultHandling?: boolean;
    Throttling?: ThrottlingOptions;
    ArgsCollector: ArgumentCollector;
    ArgsType: string;
    ArgsCount: number;
    ArgsSingleQuotes?: boolean;
    Patterns?: RegExp[];
    guarded: boolean;
    hidden: boolean;
    unknown: boolean;
    _globalEnabled: boolean;
    _throttles: Map<string, Object>;
    readonly Client: FreyaClient;
    constructor(client: FreyaClient, info: CommandInfo) {
        Command.validateInfo(client, info);
        this.Client = client
        this.Name = info.name;
        this.Aliases = info.aliases || [];
        if (typeof info.autoAliases === 'undefined' || info.autoAliases) {
            if (this.Name.includes('-')) this.Aliases.push(this.Name.replace(/-/g, ''));
            for (const alias of this.Aliases) {
                if (alias.includes('-')) this.Aliases.push(alias.replace(/-/g, ''));
            }
        }
        this.GroupID = info.group;
        this.Group = null;
        this.MemberName = info.memberName;
        this.Description = info.description;
        this.Format = info.format;
        this.Details = info.details;
        this.Examples = info.examples;
        this.GuildOnly = Boolean(info.guildOnly);
        this.OwnerOnly = Boolean(info.ownerOnly);
        this.ClientPermissions = info.clientPermissions;
        this.UserPermissions = info.userPermissions;
        this.Nsfw = Boolean(info.nsfw);
        this.DefaultHandling = 'defaultHandling' in info ? info.defaultHandling : true;
        this.Throttling = info.throttling;
        this.ArgsCollector = info.args && info.args.length ?
            new ArgumentCollector(client, info.args, info.argsPromptLimit) :
            null;
        if (this.ArgsCollector && typeof info.format === 'undefined') {
            this.Format = this.ArgsCollector.args.reduce((prev, arg) => {
                const wrapL = arg.default !== null ? '[' : '<';
                const wrapR = arg.default !== null ? ']' : '>';
                return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`;
            }, '');
        }
        this.ArgsType = info.argsType || 'single';
        this.ArgsCount = info.argsCount || 0;
        this.ArgsSingleQuotes = 'argsSingleQuotes' in info ? info.argsSingleQuotes : true;
        this.Patterns = info.patterns;
        this.guarded = Boolean(info.guarded);
        this.hidden = Boolean(info.hidden);
        this.unknown = Boolean(info.unknown);
        this._globalEnabled = true;
        this._throttles = new Map();
    }

    public hasPermission(message: FreyaMessage, ownerOverride: boolean = true): boolean | string {
        if (!this.OwnerOnly && !this.UserPermissions) return true;
        if (ownerOverride && this.Client.isOwner(message.author)) return true;

        if (this.OwnerOnly && (ownerOverride || !this.Client.isOwner(message.author))) {
            return `The \`${this.Name}\` command can only be used by the bot owner.`;
        }

        if (message.channel.type === 'text' && this.UserPermissions) {
            const missing = message.channel.permissionsFor(message.author)?.missing(this.UserPermissions);
            if (missing && missing.length > 0) {
                if (missing.length === 1) {
                    return `The \`${this.Name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
                }
                return oneLine`
					The \`${this.Name}\` command requires you to have the following permissions:
					${missing.map(perm => perm.toLowerCase()).join(', ')}
				`;
            }
        }

        return true;
    }

    public async run(message: FreyaMessage, args: object | string | string[], fromPattern: boolean, result: ArgumentCollectorResult | null): Promise<(Message | (Array<Message> | null)) | null> { // eslint-disable-line no-unused-vars, require-await
        throw new Error(`${this.constructor.name} doesn't have a run() method.`);
    }

    public onBlock(message: FreyaMessage, reason: string, data: any): Promise<(Message | (Array<Message> | null)) | null> {
        switch (reason) {
            case 'guildOnly':
                return message.reply(`The \`${this.Name}\` command must be used in a server channel.`);
            case 'nsfw':
                return message.reply(`The \`${this.Name}\` command can only be used in NSFW channels.`);
            case 'permission': {
                if (data.response) return message.reply(data.response);
                return message.reply(`You do not have permission to use the \`${this.Name}\` command.`);
            }
            case 'clientPermissions': {
                if (data.missing.length === 1) {
                    return message.reply(
                        `I need the "${permissions[data.missing[0]]}" permission for the \`${this.Name}\` command to work.`
                    );
                }
                return message.reply(oneLine`
					I need the following permissions for the \`${this.Name}\` command to work:
					${data.missing.map((perm: string) => perm.toLowerCase()).join(', ')}
				`);
            }
            case 'throttling': {
                return message.reply(
                    `You may not use the \`${this.Name}\` command again for another ${data.remaining.toFixed(1)} seconds.`
                );
            }
            default:
                return Promise.resolve(null);
        }
    }

    public onError(err: Error, message: FreyaMessage, args: object | string | string[], fromPattern: boolean, result: ArgumentCollectorResult | null): Promise<(Message | (Array<Message> | null)) | null> { // eslint-disable-line no-unused-vars
        const owners = this.Client.owners;
        const ownerList = owners ? owners!.map((usr, i) => {
            const or = i === owners.length - 1 && owners.length > 1 ? 'or ' : '';
            return `${or}${Util.escapeMarkdown(usr!.username)}#${usr!.discriminator}`;
        }).join(owners.length > 2 ? ', ' : ' ') : '';

        const invite = this.Client.options.invite;
        return message.reply(stripIndents`
			An error occurred while running the command: \`${err.name}: ${err.message}\`
			You shouldn't ever receive an error like this.
			Please contact ${ownerList || 'the bot owner'}${invite ? ` in this server: ${invite}` : '.'}
		`);
    }

    private throttle(userID: string): object | null {
        if (!this.Throttling || this.Client.isOwner(userID)) return null;

        let throttle = this._throttles.get(userID);
        if (!throttle) {
            throttle = {
                start: Date.now(),
                usages: 0,
                timeout: this.Client.setTimeout(() => {
                    this._throttles.delete(userID);
                }, this.Throttling.duration * 1000)
            };
            this._throttles.set(userID, throttle);
        }

        return throttle;
    }

    public setEnabledIn(guild: GuildResolvable | null, enabled: boolean) {
        if (typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
        if (typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
        if (this.guarded) throw new Error('The command is guarded.');
        if (!guild) {
            this._globalEnabled = enabled;
            this.Client.emit('commandStatusChange', null, this, enabled);
            return;
        }
        guild = this.Client.guilds.resolve(guild);
        guild.setCommandEnabled(this, enabled);
    }

    public isEnabledIn(guild: GuildResolvable | null, bypassGroup: boolean): boolean {
        if (this.guarded) return true;
        if (!guild) return this.Group._globalEnabled && this._globalEnabled;
        guild = this.Client.guilds.resolve(guild);
        return (bypassGroup || guild.isGroupEnabled(this.Group)) && guild.isCommandEnabled(this);
    }

    public isUsable(message: Message | null = null): boolean {
        if (!message) return this._globalEnabled;
        if (this.GuildOnly && message && !message.guild) return false;
        const hasPermission = this.hasPermission(message);
        return this.isEnabledIn(message.guild) && hasPermission && typeof hasPermission !== 'string';
    }

    usage(argString: string, prefix: string | undefined | null = this.Client.commandPrefix, user: User | null = this.Client.user): string {
        return this.usage(`${this.Name}${argString ? ` ${argString}` : ''}`, prefix, user);
    }
    reload() {
        let cmdPath, cached, newCmd;
        try {
            cmdPath = this.Client.Registry.resolveCommandPath(this.GroupID, this.MemberName);
            cached = require.cache[cmdPath];
            delete require.cache[cmdPath];
            newCmd = require(cmdPath);
        } catch (err) {
            if (cached) require.cache[cmdPath] = cached;
            try {
                cmdPath = path.join(__dirname, this.GroupID, `${this.MemberName}.js`);
                cached = require.cache[cmdPath];
                delete require.cache[cmdPath];
                newCmd = require(cmdPath);
            } catch (err2) {
                if (cached) require.cache[cmdPath] = cached;
                if (err2.message.includes('Cannot find module')) throw err; else throw err2;
            }
        }

        this.Client.Registry.reregisterCommand(newCmd, this);
    }
    unload() {
        const cmdPath = this.Client.Registry.resolveCommandPath(this.GroupID, this.MemberName);
        if (!require.cache[cmdPath]) throw new Error('Command cannot be unloaded.');
        delete require.cache[cmdPath];
        this.Client.Registry.unregisterCommand(this);
    }

    static usage(command: string, prefix: string = "", user?: User): string {
        const nbcmd = command.replace(/ /g, '\xa0');
        if (!prefix && !user) return `\`${nbcmd}\``;

        let prefixPart;
        if (prefix) {
            if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
            prefix = prefix.replace(/ /g, '\xa0');
            prefixPart = `\`${prefix}${nbcmd}\``;
        }

        let mentionPart;
        if (user) mentionPart = `\`@${user.username.replace(/ /g, '\xa0')}#${user.discriminator}\xa0${nbcmd}\``;

        return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
    }

    private static validateInfo(client: FreyaClient, info: CommandInfo) { // eslint-disable-line complexity
        if (!client) throw new Error('A client must be specified.');
        if (typeof info !== 'object') throw new TypeError('Command info must be an Object.');
        if (typeof info.name !== 'string') throw new TypeError('Command name must be a string.');
        if (info.name !== info.name.toLowerCase()) throw new Error('Command name must be lowercase.');
        if (info.aliases && (!Array.isArray(info.aliases) || info.aliases.some(ali => typeof ali !== 'string'))) {
            throw new TypeError('Command aliases must be an Array of strings.');
        }
        if (info.aliases && info.aliases.some(ali => ali !== ali.toLowerCase())) {
            throw new RangeError('Command aliases must be lowercase.');
        }
        if (typeof info.group !== 'string') throw new TypeError('Command group must be a string.');
        if (info.group !== info.group.toLowerCase()) throw new RangeError('Command group must be lowercase.');
        if (typeof info.memberName !== 'string') throw new TypeError('Command memberName must be a string.');
        if (info.memberName !== info.memberName.toLowerCase()) throw new Error('Command memberName must be lowercase.');
        if (typeof info.description !== 'string') throw new TypeError('Command description must be a string.');
        if ('format' in info && typeof info.format !== 'string') throw new TypeError('Command format must be a string.');
        if ('details' in info && typeof info.details !== 'string') throw new TypeError('Command details must be a string.');
        if (info.examples && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
            throw new TypeError('Command examples must be an Array of strings.');
        }
        if (info.clientPermissions) {
            if (!Array.isArray(info.clientPermissions)) {
                throw new TypeError('Command clientPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.clientPermissions) {
                if (!permissions[perm.toString()]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
            }
        }
        if (info.userPermissions) {
            if (!Array.isArray(info.userPermissions)) {
                throw new TypeError('Command userPermissions must be an Array of permission key strings.');
            }
            for (const perm of info.userPermissions) {
                if (!permissions[perm.toString()]) throw new RangeError(`Invalid command userPermission: ${perm}`);
            }
        }
        if (info.throttling) {
            if (typeof info.throttling !== 'object') throw new TypeError('Command throttling must be an Object.');
            if (typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
                throw new TypeError('Command throttling usages must be a number.');
            }
            if (info.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.');
            if (typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
                throw new TypeError('Command throttling duration must be a number.');
            }
            if (info.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.');
        }
        if (info.args && !Array.isArray(info.args)) throw new TypeError('Command args must be an Array.');
        if ('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
            throw new TypeError('Command argsPromptLimit must be a number.');
        }
        if ('argsPromptLimit' in info && info.argsPromptLimit && info.argsPromptLimit < 0) {
            throw new RangeError('Command argsPromptLimit must be at least 0.');
        }
        if (info.argsType && !['single', 'multiple'].includes(info.argsType)) {
            throw new RangeError('Command argsType must be one of "single" or "multiple".');
        }
        if (info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
            throw new RangeError('Command argsCount must be at least 2.');
        }
        if (info.patterns && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
            throw new TypeError('Command patterns must be an Array of regular expressions.');
        }
    }
}
