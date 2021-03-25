"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandFormatError = void 0;
const friendly_1 = require("./friendly");
/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
class CommandFormatError extends friendly_1.FriendlyError {
    constructor(msg) {
        super(`Invalid command usage. The \`${msg.Command.Name}\` command's accepted format is: ${msg.usage(msg.Command.Format, msg.guild ? undefined : null, msg.guild ? undefined : null)}. Use ${msg.anyUsage(`help ${msg.Command.Name}`, msg.guild ? undefined : null, msg.guild ? undefined : null)} for more information.`);
        this.name = 'CommandFormatError';
    }
}
exports.CommandFormatError = CommandFormatError;
//# sourceMappingURL=command-format.js.map