"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendlyError = void 0;
class FriendlyError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FriendlyError';
    }
}
exports.FriendlyError = FriendlyError;
//# sourceMappingURL=friendly.js.map