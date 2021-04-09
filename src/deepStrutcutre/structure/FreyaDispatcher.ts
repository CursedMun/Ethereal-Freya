import { Message } from "discord.js";
import { FreyaMessage } from "./extensions/message";
import { FreyaClient } from "./FreyaClient";
import { Inhibition, Inhibitor } from "./Interfaces/Interfaces";
import { FreyaRegistry } from "./registry";
import { escapeRegex } from "./util";

/** Handles parsing messages and running commands from them */
export class FreyaDispatcher {
  /**
   * @param {CommandoClient} client - Client the dispatcher is for
   * @param {CommandoRegistry} registry - Registry the dispatcher will use
   */
  readonly Client: FreyaClient;
  public Registry: FreyaRegistry;
  public Inhibitors: Set<Function>;
  private _commandPatterns: Object;
  private _results: Map<string, FreyaMessage>;
  public _awaiting: Set<string>;
  constructor(client: FreyaClient, registry: FreyaRegistry) {
    this.Client = client;
    this.Registry = registry;
    this.Inhibitors = new Set();
    this._commandPatterns = {};
    this._results = new Map();
    this._awaiting = new Set();
  }

  /**
   * @typedef {Object} Inhibition
   * @property {string} reason - Identifier for the reason the command is being blocked
   * @property {?Promise<Message>} response - Response being sent to the user
   */

  /**
   * A function that decides whether the usage of a command should be blocked
   * @callback Inhibitor
   * @param {CommandoMessage} msg - Message triggering the command
   * @return {boolean|string|Inhibition} `false` if the command should *not* be blocked.
   * If the command *should* be blocked, then one of the following:
   * - A single string identifying the reason the command is blocked
   * - An Inhibition object
   */

  /**
   * Adds an inhibitor
   * @param {Inhibitor} inhibitor - The inhibitor function to add
   * @return {boolean} Whether the addition was successful
   * @example
   * client.dispatcher.addInhibitor(msg => {
   *   if(blacklistedUsers.has(msg.author.id)) return 'blacklisted';
   * });
   * @example
   * client.dispatcher.addInhibitor(msg => {
   * 	if(!coolUsers.has(msg.author.id)) return { reason: 'cool', response: msg.reply('You\'re not cool enough!') };
   * });
   */
  addInhibitor(inhibitor: Inhibitor): boolean {
    if (typeof inhibitor !== "function")
      throw new TypeError("The inhibitor must be a function.");
    if (this.Inhibitors.has(inhibitor)) return false;
    this.Inhibitors.add(inhibitor);
    return true;
  }

  /**
   * Removes an inhibitor
   * @param {Inhibitor} inhibitor - The inhibitor function to remove
   * @return {boolean} Whether the removal was successful
   */
  removeInhibitor(inhibitor: Inhibitor): boolean {
    if (typeof inhibitor !== "function")
      throw new TypeError("The inhibitor must be a function.");
    return this.Inhibitors.delete(inhibitor);
  }

  /**
   * Handle a new message or a message update
   * @param {Message} message - The message to handle
   * @param {Message} [oldMessage] - The old message before the update
   * @return {Promise<void>}
   * @private
   */
  async handleMessage(message: FreyaMessage, oldMessage: FreyaMessage): Promise<void> {
    if (!this.shouldHandleMessage(message, oldMessage)) return;
    // Parse the message, and get the old result if it exists
    let cmdMsg, oldCmdMsg;
    if (oldMessage) {
      oldCmdMsg = this._results.get(oldMessage.id);
      if (!oldCmdMsg && !this.Client.Options.nonCommandEditable) return;
      cmdMsg = this.parseMessage(message);
      if (cmdMsg && oldCmdMsg) {
        cmdMsg.Responses = oldCmdMsg.Responses;
        cmdMsg.ResponsePositions = oldCmdMsg.ResponsePositions;
      }
    } else cmdMsg = this.parseMessage(message);

    // Run the command, or reply with an error
    let responses: Message | Message[] | null = null;
    if (cmdMsg) {
      const inhibited = this.inhibit(cmdMsg);

      if (!inhibited) {
        if (cmdMsg.Command) {
          if (!cmdMsg.Command.isEnabledIn(message.guild, true)) {
            if (!cmdMsg.Command.unknown) {
              responses = await cmdMsg.reply(
                `The \`${cmdMsg.Command.Name}\` command is disabled.`
              );
            } else {
              /**
               * Emitted when an unknown command is triggered
               * @event CommandoClient#unknownCommand
               * @param {CommandoMessage} message - Command message that triggered the command
               */
              this.Client.emit("unknownCommand", cmdMsg);
              responses = null;
            }
          } else if (!oldMessage || typeof oldCmdMsg !== "undefined") {
            responses = await cmdMsg.run();
            if (typeof responses === "undefined") responses = null;
            if (Array.isArray(responses))
              responses = await Promise.all(responses);
          }
        } else {
          this.Client.emit("unknownCommand", cmdMsg);
          responses = null;
        }
      } else responses = await inhibited.response!;

      cmdMsg.finalize(responses);
    } else if (oldCmdMsg) {
      oldCmdMsg.finalize(null);
      if (!this.Client.Options.nonCommandEditable)
        this._results.delete(message.id);
    }

    this.cacheFreyaMessage(message, oldMessage, cmdMsg, responses);
    /* eslint-enable max-depth */
  }

  /**
   * Check whether a message should be handled
   * @param {Message} message - The message to handle
   * @param {Message} [oldMessage] - The old message before the update
   * @return {boolean}
   * @private
   */
  shouldHandleMessage(message: FreyaMessage, oldMessage: FreyaMessage) {
    // Ignore partial messages
    if (
      message.partial ||
      message.author.bot ||
      message.author.id === this.Client.user!.id
    )
      return false;

    // Ignore messages from users that the bot is already waiting for input from
    if (this._awaiting.has(message.author.id + message.channel.id))
      return false;

    // Make sure the edit actually changed the message content
    if (oldMessage && message.content === oldMessage.content) return false;

    return true;
  }

  /**
   * Inhibits a command message
   * @param {CommandoMessage} cmdMsg - Command message to inhibit
   * @return {?Inhibition}
   * @private
   */
  inhibit(cmdMsg: FreyaMessage): Inhibition | null {
    for (const inhibitor of this.Inhibitors) {
      let inhibit = inhibitor(cmdMsg);
      if (inhibit) {
        if (typeof inhibit !== "object")
          inhibit = { reason: inhibit, response: undefined };

        const valid =
          typeof inhibit.reason === "string" &&
          (typeof inhibit.response === "undefined" ||
            inhibit.response === null ||
            inhibit.response instanceof Promise);
        if (!valid) {
          throw new TypeError(
            `Inhibitor "${inhibitor.name}" had an invalid result; must be a string or an Inhibition object.`
          );
        }

        this.Client.emit("commandBlock", cmdMsg, inhibit.reason, inhibit);
        return inhibit;
      }
    }
    return null;
  }

  /**
   * Caches a command message to be editable
   * @param {Message} message - Triggering message
   * @param {Message} oldMessage - Triggering message's old version
   * @param {CommandoMessage} cmdMsg - Command message to cache
   * @param {Message|Message[]} responses - Responses to the message
   * @private
   */
  private cacheFreyaMessage(
    message: FreyaMessage,
    oldMessage: FreyaMessage,
    cmdMsg: FreyaMessage,
    responses: FreyaMessage | FreyaMessage[] | null
  ) {
    if (this.Client.Options.commandEditableDuration! <= 0) return;
    if (!cmdMsg && !this.Client.Options.nonCommandEditable) return;
    if (responses !== null) {
      this._results.set(message.id, cmdMsg);
      if (!oldMessage)
        setTimeout(() => {
          this._results.delete(message.id);
        }, this.Client.Options.commandEditableDuration! * 1000);
    } else this._results.delete(message.id);
  }

  /**
   * Parses a message to find details about command usage in it
   * @param {Message} message - The message
   * @return {?CommandoMessage}
   * @private
   */
  private parseMessage(message: FreyaMessage): FreyaMessage {
    // Find the command to run by patterns
    for (const command of this.Registry.Commands.values()) {
      if (!command.Patterns) continue;
      for (const pattern of command.Patterns) {
        const matches = pattern.exec(message.content);
        if (matches) return message.initCommand(command, "", matches);
      }
    }

    // Find the command to run with default command handling
    const prefix = message.guild
      ? message.guild.commandPrefix
      : this.Client.commandPrefix;
    if (!this._commandPatterns[prefix]) this.buildCommandPattern(prefix);
    let cmdMsg = this.matchDefault(message, this._commandPatterns[prefix], 2);
    if (!cmdMsg && !message.guild)
      cmdMsg = this.matchDefault(message, /^([^\s]+)/i, 1, true);
    return cmdMsg;
  }

  /**
   * Matches a message against a guild command pattern
   * @param {Message} message - The message
   * @param {RegExp} pattern - The pattern to match against
   * @param {number} commandNameIndex - The index of the command name in the pattern matches
   * @param {boolean} prefixless - Whether the match is happening for a prefixless usage
   * @return {?CommandoMessage}
   * @private
   */
  private matchDefault(
    message: FreyaMessage,
    pattern: RegExp,
    commandNameIndex: number = 1,
    prefixless: boolean = false
  ): FreyaMessage | null {
    const matches = pattern.exec(message.content);
    if (!matches) return null;
    const commands = this.Registry.findCommands(
      matches[commandNameIndex],
      true
    );
    if (commands.length !== 1 || !commands[0].DefaultHandling) {
      return message.initCommand(
        this.Registry.UnknownCommand!,
        prefixless ? message.content : matches[1]
      );
    }
    const argString = message.content.substring(
      matches[1].length + (matches[2] ? matches[2].length : 0)
    );
    return message.initCommand(commands[0], argString);
  }

  /**
   * Creates a regular expression to match the command prefix and name in a message
   * @param {?string} prefix - Prefix to build the pattern for
   * @return {RegExp}
   * @private
   */
  buildCommandPattern(prefix: string) {
    let pattern = prefix
      ? new RegExp(
          `^(<@!?${this.Client.user!.id}>\\s+(?:${escapeRegex(
            prefix
          )}\\s*)?|${escapeRegex(prefix)}\\s*)([^\\s]+)`,
          "i"
        )
      : new RegExp(`(^<@!?${this.Client.user!.id}>\\s+)([^\\s]+)`, "i");
    this._commandPatterns[prefix] = pattern;
    this.Client.emit(
      "debug",
      `Built command pattern for prefix "${prefix}": ${pattern}`
    );
    return pattern;
  }
}
