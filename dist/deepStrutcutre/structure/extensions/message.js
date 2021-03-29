"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreyaMessage = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const base_1 = require("../commands/base");
const command_format_1 = require("../errors/command-format");
const friendly_1 = require("../errors/friendly");
class FreyaMessage extends discord_js_1.Message {
    constructor(client, data, channel) {
        super(client, data, channel);
        this.IsCommand = false;
        this.Command = null;
        this.ArgString = null;
        this.PatternMatches = null;
        this.Responses = null;
        this.ResponsePositions = null;
    }
    initCommand(command, argString, patternMatches) {
        this.IsCommand = true;
        this.Command = command;
        this.ArgString = argString;
        this.PatternMatches = patternMatches;
        return this;
    }
    usage(argString, prefix, user = this.Client.user) {
        if (typeof prefix === "undefined") {
            if (this.guild)
                prefix = this.guild.commandPrefix;
            else
                prefix = this.Client.commandPrefix;
        }
        return this.Command.usage(argString, prefix, user);
    }
    anyUsage(command, prefix, user = this.Client.user) {
        if (typeof prefix === "undefined") {
            if (this.guild)
                prefix = this.guild.commandPrefix;
            else
                prefix = this.Client.commandPrefix;
        }
        return base_1.Command.usage(command, prefix, user);
    }
    /**
     * Parses the argString into usable arguments, based on the argsType and argsCount of the command
     * @return {string|string[]}
     * @see {@link Command#run}
     */
    parseArgs() {
        switch (this.Command.ArgsType) {
            case "single":
                return this.ArgString.trim().replace(this.Command.ArgsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, "$2");
            case "multiple":
                return FreyaMessage.parseArgs(this.ArgString, this.Command.ArgsCount, this.Command.ArgsSingleQuotes);
            default:
                throw new RangeError(`Unknown argsType "${this.Command.ArgsType}".`);
        }
    }
    /**
     * Runs the command
     * @return {Promise<?Message|?Array<Message>>}
     */
    async run() {
        //Obtain member
        // if (
        //   this.channel.type === "text" &&
        //   !this.guild.members.cache.has(this.author.id) &&
        //   !this.webhookID
        // ) {
        //   this.member = await this.guild.members.fetch(this.author);
        // }
        // Obtain the member for the ClientUser if it doesn't already exist
        if (this.channel.type === "text" &&
            !this.guild.members.cache.has(this.Client.user.id)) {
            await this.guild.members.fetch(this.Client.user.id);
        }
        // Make sure the command is usable in this context
        if (this.Command.GuildOnly && !this.guild) {
            this.Client.emit("commandBlock", this, "guildOnly");
            return this.Command.onBlock(this, "guildOnly");
        }
        // Ensure the channel is a NSFW one if required
        if (this.Command.Nsfw &&
            this.channel.type == "text" &&
            !this.channel.nsfw) {
            this.Client.emit("commandBlock", this, "nsfw");
            return this.Command.onBlock(this, "nsfw");
        }
        // Ensure the user has permission to use the command
        const hasPermission = this.Command.hasPermission(this);
        if (!hasPermission || typeof hasPermission === "string") {
            const data = {
                response: typeof hasPermission === "string" ? hasPermission : undefined,
            };
            this.Client.emit("commandBlock", this, "permission", data);
            return this.Command.onBlock(this, "permission", data);
        }
        // Ensure the client user has the required permissions
        if (this.channel.type === "text" && this.Command.ClientPermissions) {
            const missing = this.channel
                .permissionsFor(this.Client.user)
                .missing(this.Command.ClientPermissions);
            if (missing.length > 0) {
                const data = { missing };
                this.Client.emit("commandBlock", this, "clientPermissions", data);
                return this.Command.onBlock(this, "clientPermissions", data);
            }
        }
        // Throttle the command
        const throttle = this.Command.throttle(this.author.id);
        if (throttle && throttle.usages + 1 > this.Command.Throttling.usages) {
            const remaining = (throttle.start +
                this.Command.Throttling.duration * 1000 -
                Date.now()) /
                1000;
            const data = { throttle, remaining };
            this.Client.emit("commandBlock", this, "throttling", data);
            return this.Command.onBlock(this, "throttling", data);
        }
        // Figure out the command arguments
        let args = this.PatternMatches;
        let collResult = null;
        if (!args && this.Command.ArgsCollector) {
            const collArgs = this.Command.ArgsCollector.args;
            const count = collArgs[collArgs.length - 1].infinite
                ? Infinity
                : collArgs.length;
            const provided = FreyaMessage.parseArgs(this.ArgString.trim(), count, this.Command.ArgsSingleQuotes);
            collResult = await this.Command.ArgsCollector.obtain(this, provided);
            if (collResult.cancelled) {
                if (collResult.prompts.length === 0 ||
                    collResult.cancelled === "promptLimit") {
                    const err = new command_format_1.CommandFormatError(this);
                    return this.reply(err.message);
                }
                this.Client.emit("commandCancel", this.Command, collResult.cancelled, this, collResult);
                return this.reply("Cancelled command.");
            }
            args = collResult.values;
        }
        if (!args)
            args = this.parseArgs();
        const fromPattern = Boolean(this.PatternMatches);
        // Run the command
        if (throttle)
            throttle.usages++;
        const typingCount = this.channel.typingCount;
        try {
            this.Client.emit("debug", `Running command ${this.Command.GroupID}:${this.Command.MemberName}.`);
            const promise = this.Command.run(this, args, fromPattern, collResult);
            this.Client.emit("commandRun", this.Command, promise, this, args, fromPattern, collResult);
            const retVal = await promise;
            if (!(retVal instanceof discord_js_1.Message ||
                retVal instanceof Array ||
                retVal === null ||
                retVal === undefined)) {
                throw new TypeError(common_tags_1.oneLine `
						Command ${this.Command.Name}'s run() resolved with an unknown type
						(${retVal !== null
                    ? retVal && retVal.constructor
                        ? retVal.constructor.name
                        : typeof retVal
                    : null}).
						Command run methods must return a Promise that resolve with a Message, Array of Messages, or null/undefined.
					`);
            }
            return retVal;
        }
        catch (err) {
            this.Client.emit("commandError", this.Command, err, this, args, fromPattern, collResult);
            if (this.channel.typingCount > typingCount)
                this.channel.stopTyping();
            if (err instanceof friendly_1.FriendlyError) {
                return this.reply(err.message);
            }
            else {
                return this.Command.onError(err, this, args, fromPattern, collResult);
            }
        }
    }
    /**
     * Responds to the command message
     * @param {Object} [options] - Options for the response
     * @return {Message|Message[]}
     * @private
     */
    async respond({ type = "reply", content, options, lang = null, fromEdit = false }) {
        const shouldEdit = this.Responses && !fromEdit;
        if (shouldEdit) {
            if (options && options.split && typeof options.split !== "object")
                options.split = {};
        }
        if (type === "reply" && this.channel.type === "dm")
            type = "plain";
        if (type !== "direct") {
            if (this.guild &&
                this.channel.type == "text" &&
                !this.channel.permissionsFor(this.Client.user).has("SEND_MESSAGES")) {
                type = "direct";
            }
        }
        content = discord_js_1.Util.resolveString(content);
        switch (type) {
            case "plain":
                if (!shouldEdit)
                    return this.channel.send(content, options);
                return this.editCurrentResponse(channelIDOrDM(this.channel), {
                    type,
                    content,
                    options,
                });
            case "reply":
                if (!shouldEdit)
                    return super.reply(content, options);
                if (options && options.split && !options.split.prepend)
                    options.split.prepend = `${this.author}, `;
                return this.editCurrentResponse(channelIDOrDM(this.channel), {
                    type,
                    content,
                    options,
                });
            case "direct":
                if (!shouldEdit)
                    return this.author.send(content, options);
                return this.editCurrentResponse("dm", { type, content, options });
            case "code":
                if (!shouldEdit)
                    return this.channel.send(content, options);
                if (options && options.split) {
                    if (!options.split.prepend)
                        options.split.prepend = `\`\`\`${lang || ""}\n`;
                    if (!options.split.append)
                        options.split.append = "\n```";
                }
                content = `\`\`\`${lang || ""}\n${discord_js_1.Util.escapeMarkdown(content)}\n\`\`\``;
                return this.editCurrentResponse(channelIDOrDM(this.channel), {
                    type,
                    content,
                    options,
                });
            default:
                throw new RangeError(`Unknown response type "${type}".`);
        }
    }
    editResponse(response, { type, content, options }) {
        if (!response)
            return this.respond({ type, content, options, lang: null, fromEdit: true });
        if (options && options.split)
            content = discord_js_1.Util.splitMessage(content, options.split);
        let prepend = "";
        if (type === "reply")
            prepend = `${this.author}, `;
        if (content instanceof Array) {
            const promises = [];
            if (response instanceof Array) {
                for (let i = 0; i < content.length; i++) {
                    if (response.length > i)
                        promises.push(response[i].edit(`${prepend}${content[i]}`, options));
                    else
                        promises.push(response[0].channel.send(`${prepend}${content[i]}`));
                }
            }
            else {
                promises.push(response.edit(`${prepend}${content[0]}`, options));
                for (let i = 1; i < content.length; i++) {
                    promises.push(response.channel.send(`${prepend}${content[i]}`));
                }
            }
            return Promise.all(promises);
        }
        else {
            if (response instanceof Array) {
                // eslint-disable-line no-lonely-if
                for (let i = response.length - 1; i > 0; i--)
                    response[i].delete();
                return response[0].edit(`${prepend}${content}`, options);
            }
            else {
                return response.edit(`${prepend}${content}`, options);
            }
        }
    }
    editCurrentResponse(id, options) {
        if (typeof this.Responses[id] === "undefined")
            this.Responses[id] = [];
        if (typeof this.ResponsePositions[id] === "undefined")
            this.ResponsePositions[id] = -1;
        this.ResponsePositions[id]++;
        return this.editResponse(this.Responses[id][this.ResponsePositions[id]], options);
    }
    say(content, options) {
        if (!options &&
            typeof content === "object" &&
            !(content instanceof Array)) {
            options = content;
            content = "";
        }
        return this.respond({ type: "plain", content, options });
    }
    reply(content = '', options = {}) {
        if (!options &&
            typeof content === "object" &&
            !(content instanceof Array)) {
            options = content;
            content = "";
        }
        return this.respond({ type: "reply", content, options });
    }
    direct(content, options) {
        if (!options &&
            typeof content === "object" &&
            !(content instanceof Array)) {
            options = content;
            content = "";
        }
        return this.respond({ type: "direct", content, options });
    }
    code(lang, content, options) {
        if (!options &&
            typeof content === "object" &&
            !(content instanceof Array)) {
            options = content;
            content = "";
        }
        if (typeof options !== "object")
            options = {};
        options.code = lang;
        return this.respond({ type: "code", content, options });
    }
    embed(embed, content = "", options) {
        if (typeof options !== "object")
            options = {};
        options.embed = embed;
        return this.respond({ type: "plain", content, options });
    }
    replyEmbed(embed, content = "", options) {
        if (typeof options !== "object")
            options = {};
        options.embed = embed;
        return this.respond({ type: "reply", content, options });
    }
    finalize(responses) {
        if (this.Responses)
            this.deleteRemainingResponses();
        this.Responses = {};
        this.ResponsePositions = {};
        if (responses instanceof Array) {
            for (const response of responses) {
                const channel = (response instanceof Array ? response[0] : response)
                    .channel;
                const id = channelIDOrDM(channel);
                if (!this.Responses[id]) {
                    this.Responses[id] = [];
                    this.ResponsePositions[id] = -1;
                }
                this.Responses[id].push(response);
            }
        }
        else if (responses) {
            const id = channelIDOrDM(responses.channel);
            this.Responses[id] = [responses];
            this.ResponsePositions[id] = -1;
        }
    }
    deleteRemainingResponses() {
        for (const id of Object.keys(this.Responses)) {
            const responses = this.Responses[id];
            for (let i = this.ResponsePositions[id] + 1; i < responses.length; i++) {
                const response = responses[i];
                if (response instanceof Array) {
                    for (const resp of response)
                        resp.delete();
                }
                else {
                    response.delete();
                }
            }
        }
    }
    static parseArgs(argString, argCount, allowSingleQuote = true) {
        const argStringModified = removeSmartQuotes(argString, allowSingleQuote);
        const re = allowSingleQuote
            ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g
            : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
        const result = [];
        let match = [];
        // Large enough to get all items
        argCount = argCount || argStringModified.length;
        // Get match and push the capture group that is not null to the result
        while (--argCount && (match = re.exec(argStringModified)))
            result.push(match[2] || match[3]);
        // If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
        if (match && re.lastIndex < argStringModified.length) {
            const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
            result.push(argStringModified.substr(re.lastIndex).replace(re2, "$2"));
        }
        return result;
    }
}
exports.FreyaMessage = FreyaMessage;
exports.default = discord_js_1.Structures.extend("Message", () => FreyaMessage);
function removeSmartQuotes(argString, allowSingleQuote = true) {
    let replacementArgString = argString;
    const singleSmartQuote = /[‘’]/g;
    const doubleSmartQuote = /[“”]/g;
    if (allowSingleQuote)
        replacementArgString = argString.replace(singleSmartQuote, "'");
    return replacementArgString.replace(doubleSmartQuote, '"');
}
function channelIDOrDM(channel) {
    if (channel.type !== "dm")
        return channel.id;
    return "dm";
}
//# sourceMappingURL=message.js.map