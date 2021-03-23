"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const fs_1 = require("fs");
const glob_1 = require("glob");
require("path");
const Logger_1 = require("../helpers/Logger");
class Store {
    constructor(client, type) {
        this.client = client;
        this.type = type;
        this.folderPath = this.client.folders[this.type].path;
        this.exec(this.folderPath);
    }
    exec(foldername) {
        try {
            if (!fs_1.existsSync(foldername))
                fs_1.mkdirSync(foldername);
            glob_1.glob(foldername, (err, res) => {
                this.client.folders[this.type].files = res.filter(x => x.endsWith(".js"));
            });
            return this;
        }
        catch (err) {
            Logger_1.Logger.error(err);
        }
    }
}
exports.Store = Store;
;
//# sourceMappingURL=Store.js.map