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
        var _a, _b, _c, _d;
        super(`Invalid command usage. The \`${(_a = msg.Command) === null || _a === void 0 ? void 0 : _a.Name}\` command's accepted format is: ${msg.usage((_c = (_b = msg.Command) === null || _b === void 0 ? void 0 : _b.Format) !== null && _c !== void 0 ? _c : "", msg.guild ? undefined : null, msg.guild ? undefined : null)}. Use ${msg.anyUsage(`help ${(_d = msg.Command) === null || _d === void 0 ? void 0 : _d.Name}`, "", msg.guild ? undefined : null)} for more information.`);
        this.name = 'CommandFormatError';
    }
}
exports.CommandFormatError = CommandFormatError;
//# sourceMappingURL=command-format.js.map