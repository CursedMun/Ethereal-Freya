"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class BooleanArgumentType extends base_1.default {
    constructor(client) {
        super(client, "boolean");
        this.truthy = new Set([
            "true",
            "t",
            "yes",
            "y",
            "on",
            "enable",
            "enabled",
            "1",
            "+",
        ]);
        this.falsy = new Set([
            "false",
            "f",
            "no",
            "n",
            "off",
            "disable",
            "disabled",
            "0",
            "-",
        ]);
    }
    validate(val) {
        const lc = val.toLowerCase();
        return this.truthy.has(lc) || this.falsy.has(lc);
    }
    parse(val) {
        const lc = val.toLowerCase();
        if (this.truthy.has(lc))
            return true;
        if (this.falsy.has(lc))
            return false;
        throw new RangeError("Unknown boolean value.");
    }
}
exports.default = BooleanArgumentType;
//# sourceMappingURL=boolean.js.map