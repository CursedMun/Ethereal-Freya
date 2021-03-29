"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreyaClient = void 0;
const discord_js_1 = require("discord.js");
const FreyaDispatcher_1 = require("./FreyaDispatcher");
const helper_1 = require("./providers/helper");
const registry_1 = require("./registry");
// const CommandoRegistry = require('./registry');
// const CommandDispatcher = require('./dispatcher');
// const GuildSettingsHelper = require('./providers/helper');
class FreyaClient extends discord_js_1.Client {
    constructor(options) {
        FreyaClient.ValidateInfo(options);
        super(options);
        this.Options = options;
        this.commandPrefix;
        this.Registry = new registry_1.FreyaRegistry(this);
        this.Dispatcher = new FreyaDispatcher_1.FreyaDispatcher(this, this.Registry);
        this.Provider = null;
        this.settings = new helper_1.GuildSettingsHelper(this, null);
        this._commandPrefix = null;
        // Set up command handling
        const msgErr = (err) => { this.emit('error', err); };
        this.on('message', message => { this.dispatcher.handleMessage(message).catch(msgErr); });
        this.on('messageUpdate', (oldMessage, newMessage) => {
            this.dispatcher.handleMessage(newMessage, oldMessage).catch(msgErr);
        });
        // Fetch the owner(s)
        if (options.owner) {
            this.once('ready', () => {
                if (options.owner instanceof Array || options.owner instanceof Set) {
                    for (const owner of options.owner) {
                        this.users.fetch(owner).catch(err => {
                            this.emit('warn', `Unable to fetch owner ${owner}.`);
                            this.emit('error', err);
                        });
                    }
                }
                else {
                    this.users.fetch(options.owner).catch(err => {
                        this.emit('warn', `Unable to fetch owner ${options.owner}.`);
                        this.emit('error', err);
                    });
                }
            });
        }
    }
    /**
     * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
     * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
     * @type {string}
     * @emits {@link CommandoClient#commandPrefixChange}
     */
    get commandPrefix() {
        if (typeof this._commandPrefix === 'undefined' || this._commandPrefix === null)
            return this.Options.commandPrefix;
        return this._commandPrefix;
    }
    set commandPrefix(prefix) {
        this._commandPrefix = prefix;
        this.emit('commandPrefixChange', null, this._commandPrefix);
    }
    /**
     * Owners of the bot, set by the {@link CommandoClientOptions#owner} option
     * <info>If you simply need to check if a user is an owner of the bot, please instead use
     * {@link CommandoClient#isOwner}.</info>
     * @type {?Array<User>}
     * @readonly
     */
    get owners() {
        if (!this.Options.owner)
            return null;
        if (typeof this.Options.owner === 'string')
            return [this.users.cache.get(this.Options.owner)];
        const owners = [];
        for (const owner of this.Options.owner)
            owners.push(this.users.cache.get(owner));
        return owners;
    }
    /**
     * Checks whether a user is an owner of the bot (in {@link CommandoClientOptions#owner})
     * @param {UserResolvable} user - User to check for ownership
     * @return {boolean}
     */
    isOwner(user) {
        if (!this.Options.owner)
            return false;
        user = this.users.resolve(user);
        if (!user)
            throw new RangeError('Unable to resolve user.');
        if (typeof this.Options.owner === 'string')
            return user.id === this.Options.owner;
        if (this.Options.owner instanceof Array)
            return this.Options.owner.includes(user.id);
        if (this.Options.owner instanceof Set)
            return this.Options.owner.has(user.id);
        throw new RangeError('The client\'s "owner" option is an unknown value.');
    }
    /**
     * Sets the setting Provider to use, and initialises it once the client is ready
     * @param {SettingProvider|Promise<SettingProvider>} Provider Provider to use
     * @return {Promise<void>}
     */
    async setProvider(Provider) {
        const newProvider = await Provider;
        this.Provider = newProvider;
        if (this.readyTimestamp) {
            this.emit('debug', `Provider set to ${newProvider.constructor.name} - initialising...`);
            await newProvider.init(this);
            this.emit('debug', 'Provider finished initialisation.');
            return undefined;
        }
        this.emit('debug', `Provider set to ${newProvider.constructor.name} - will initialise once ready.`);
        await new Promise(resolve => {
            this.once('ready', () => {
                this.emit('debug', `Initialising Provider...`);
                resolve(newProvider.init(this));
            });
        });
        /**
         * Emitted upon the client's Provider finishing initialisation
         * @event CommandoClient#providerReady
         * @param {SettingProvider} Provider - Provider that was initialised
         */
        this.emit('providerReady', Provider);
        this.emit('debug', 'Provider finished initialisation.');
        return undefined;
    }
    static ValidateInfo(options) {
        if (typeof options.commandPrefix === 'undefined')
            options.commandPrefix = '!';
        if (options.commandPrefix === null)
            options.commandPrefix = '';
        if (typeof options.commandEditableDuration === 'undefined')
            options.commandEditableDuration = 30;
        if (typeof options.nonCommandEditable === 'undefined')
            options.nonCommandEditable = true;
    }
    async destroy() {
        await super.destroy();
        if (this.Provider)
            await this.Provider.destroy();
    }
}
exports.FreyaClient = FreyaClient;
//# sourceMappingURL=FreyaClient.js.map