"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreyaClient = void 0;
const discord_js_1 = require("discord.js");
const Types_1 = require("../helpers/Types");
const Store_1 = require("./Store");
class FreyaClient extends discord_js_1.Client {
    constructor(opts, token = "") {
        var _a;
        var myOptions = {
            prefix: opts.prefix,
            folders: opts.folders,
            token: token
        };
        delete opts.folders;
        delete opts.prefix;
        super(opts);
        this.token = myOptions.token;
        this.folders = Object.assign({}, myOptions.folders);
        this.prefix = (_a = opts.prefix) !== null && _a !== void 0 ? _a : "!";
        new Store_1.Store(this, Types_1.FileType["Commands"]);
        new Store_1.Store(this, Types_1.FileType["Events"]);
        if (!this.token)
            throw new Error("Token is empty");
        this.login(this.token);
    }
}
exports.FreyaClient = FreyaClient;
//# sourceMappingURL=FreyaClient.js.map