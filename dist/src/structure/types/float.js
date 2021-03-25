"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatArgumentType = void 0;
const base_1 = require("./base");
class FloatArgumentType extends base_1.ArgumentType {
    constructor(client) {
        super(client, 'float');
    }
    validate(val, msg, arg) {
        const float = Number.parseFloat(val);
        if (Number.isNaN(float))
            return false;
        if (arg.oneOf && !arg.oneOf.includes(float)) {
            return `Please enter one of the following options: ${arg.oneOf.map(opt => `\`${opt}\``).join(', ')}`;
        }
        if (arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
            return `Please enter a number above or exactly ${arg.min}.`;
        }
        if (arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
            return `Please enter a number below or exactly ${arg.max}.`;
        }
        return true;
    }
    parse(val) {
        return Number.parseFloat(val);
    }
}
exports.FloatArgumentType = FloatArgumentType;
//# sourceMappingURL=float.js.map