"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class IntegerArgumentType extends base_1.default {
    constructor(client) {
        super(client, 'int');
    }
    validate(val, msg, arg) {
        const int = Number.parseInt(val);
        if (Number.isNaN(int))
            return false;
        if (arg.oneOf && !arg.oneOf.includes(int)) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
            return `Please enter a number above or exactly ${arg.min}.`;
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
            return `Please enter a number below or exactly ${arg.max}.`;
        }
        return true;
    }
    parse(val) {
        return Number.parseInt(val);
    }
}
exports.default = IntegerArgumentType;
//# sourceMappingURL=int.js.map