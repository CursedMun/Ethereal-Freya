import { Command } from "../deepStrutcutre/structure/commands/base";
import { FreyaMessage } from "../deepStrutcutre/structure/extensions/message";
import { FreyaClient } from "../deepStrutcutre/structure/FreyaClient";


export class TestCommand extends Command {
    constructor(client: FreyaClient) {
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

    run(msg: FreyaMessage, { value }) {
        return msg.say(`You rolled a ${Math.floor(Math.random() * value) + 1}.`);
    }
};
