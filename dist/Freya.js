"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Inversify_config_1 = require("./dependecy/Inversify.config");
const Global_1 = require("./dependecy/Global");
let client = Inversify_config_1.default.get(Global_1.Global.Client);
client.startUp().then(() => {
    console.log('Logged in!');
}).catch((error) => {
    console.log('Oh no! ', error);
});
//# sourceMappingURL=Freya.js.map