"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCommand = void 0;
const base_1 = require("../deepStrutcutre/structure/commands/base");
class TestCommand extends base_1.Command {
    constructor(client) {
        super(client, {
            name: 'test',
            aliases: ['test'],
            group: 'Test',
            memberName: 'roll',
            description: 'Rolls a dice with a maximum value of your choice.',
            args: [
                {
                    key: 'value',
                    label: 'maximum number',
                    prompt: 'What is the maximum number you wish to appear?',
                    type: 'integer',
                    default: 6
                }
            ]
        });
    }
    run(msg, { value }) {
        return msg.say(`You rolled a ${Math.floor(Math.random() * value) + 1}.`);
    }
}
exports.TestCommand = TestCommand;
;
//# sourceMappingURL=test.js.map