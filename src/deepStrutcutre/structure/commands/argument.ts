
import { Message } from "discord.js";
import { FreyaMessage } from "../extensions/message";
import { FreyaClient } from "../FreyaClient";
import { ArgumentInfo, ArgumentDefault, ArgumentResult } from "../Interfaces/Interfaces";
import ArgumentType from "../types/base";

const { escapeMarkdown } = require('discord.js');
const { oneLine, stripIndents } = require('common-tags');
const isPromise = require('is-promise');
const ArgumentUnionType = require('../types/union');

export class Argument {
    key: string;
    label: string;
    prompt: string;
    error?: string;
    type: ArgumentType | null;
    max: number | null;
    min: number | null;
    default: ArgumentDefault;
    oneOf?: string[] | null;
    infinite: boolean;
    validator: Function | null;
    parser: Function | null;
    emptyChecker: Function | null;
    wait: number;
    constructor(client: FreyaClient, info: ArgumentInfo) {
        Argument.validateInfo(client, info);
        this.key = info.key;
        this.label = info.label || info.key;
        this.prompt = info.prompt;
        this.error = info.error;
        this.type = Argument.determineType(client, info.type);
        this.max = typeof info.max !== 'undefined' ? info.max : null;
        this.min = typeof info.min !== 'undefined' ? info.min : null;
        this.default = typeof info.default !== 'undefined' ? info.default : null;
        this.oneOf = typeof info.oneOf !== 'undefined' ?
            info.oneOf.map(el => el.toLowerCase ? el.toLowerCase() : el) :
            null;
        this.infinite = Boolean(info.infinite);
        this.validator = info.validate || null;
        this.parser = info.parse || null;
        this.emptyChecker = info.isEmpty || null;
        this.wait = typeof info.wait !== 'undefined' ? info.wait : 30;
    }

    async obtain(msg: FreyaMessage, val: string, promptLimit: number = Infinity): Promise<ArgumentResult> {
        let empty = this.isEmpty(val, msg);
        if (empty && this.default !== null) {
            return {
                value: typeof this.default === 'function' ? await this.default(msg, this) : this.default,
                cancelled: undefined,
                prompts: [],
                answers: []
            };
        }
        if (this.infinite) return this.obtainInfinite(msg, val, promptLimit);

        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
        const prompts: (Message | Message[])[] = [];
        const answers: (Message)[] = [];
        let valid = !empty ? await this.validate(val, msg) : false;

        while (!valid || typeof valid === 'string') {
            if (prompts.length >= promptLimit) {
                return {
                    value: null,
                    cancelled: 'promptLimit',
                    prompts: [],
                    answers: [],
                };
            }

            // Prompt the user for a new value
            prompts.push(await msg.reply(stripIndents`
				${empty ? this.prompt : valid ? valid : `You provided an invalid ${this.label}. Please try again.`}
				${oneLine`
					Respond with \`cancel\` to cancel the command.
					${wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''}
				`}
			`));

            // Get the user's response
            const responses = await msg.channel.awaitMessages((msg2: any) => msg2.author.id === msg.author.id, {
                max: 1,
                time: wait
            });

            // Make sure they actually answered
            if (responses && responses.size === 1) {
                answers.push(responses.first()!);
                val = answers[answers.length - 1]!.content;
            } else {
                return {
                    value: null,
                    cancelled: 'time',
                    prompts,
                    answers: []
                };
            }
            if (val.toLowerCase() === 'cancel') {
                return {
                    value: null,
                    cancelled: 'user',
                    prompts,
                    answers
                };
            }

            empty = this.isEmpty(val, msg, responses.first());
            valid = await this.validate(val, msg, responses.first());
            /* eslint-enable no-await-in-loop */
        }

        return {
            value: await this.parse(val, msg, answers.length ? answers[answers.length - 1] : msg),
            cancelled: undefined,
            prompts,
            answers
        };
    }

    private async obtainInfinite(msg: FreyaMessage, vals: string[] | string, promptLimit: number = Infinity): Promise<ArgumentResult> {
        const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
        const results = [];
        const prompts = [];
        const answers: (Message)[] = [];
        let currentVal = 0;

        while (true) {
            let val = vals && vals[currentVal] ? vals[currentVal] : null;
            let valid = val ? await this.validate(val, msg) : false;
            let attempts = 0;

            while (!valid || typeof valid === 'string') {
                attempts++;
                if (attempts > promptLimit)
                    return {
                        value: null,
                        cancelled: 'promptLimit',
                        prompts,
                        answers: []
                    };

                if (val) {
                    const escaped = escapeMarkdown(val).replace(/@/g, '@\u200b');
                    prompts.push(await msg.reply(stripIndents`
						${valid ? valid : oneLine`
							You provided an invalid ${this.label},
							"${escaped.length < 1850 ? escaped : '[too long to show]'}".
							Please try again.
						`}
						${oneLine`
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.
							${wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''}
						`}
					`));
                } else if (results.length === 0) {
                    prompts.push(await msg.reply(stripIndents`
						${this.prompt}
						${oneLine`
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.
							${wait ? `The command will automatically be cancelled in ${this.wait} seconds, unless you respond.` : ''}
						`}
					`));
                }

                const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
                    max: 1,
                    time: wait
                });
                if (responses && responses.size === 1) {
                    answers.push(responses.first()!);
                    val = answers[answers.length - 1]!.content;
                } else {
                    return {
                        value: null,
                        cancelled: 'time',
                        prompts,
                        answers: []
                    };
                }
                const lc = val.toLowerCase();
                if (lc === 'finish') {
                    return {
                        value: results.length > 0 ? results : null,
                        cancelled: this.default ? undefined : results.length > 0 ? undefined : 'user',
                        prompts,
                        answers
                    };
                }
                if (lc === 'cancel') {
                    return {
                        value: null,
                        cancelled: 'user',
                        prompts,
                        answers
                    };
                }

                valid = await this.validate(val, msg, responses.first());
            }

            results.push(await this.parse(val!, msg, answers.length ? answers[answers.length - 1] : msg));

            if (vals) {
                currentVal++;
                if (currentVal === vals.length) {
                    return {
                        value: results,
                        cancelled: undefined,
                        prompts,
                        answers
                    };
                }
            }
        }
    }
    validate(val: string, originalMsg: FreyaMessage | Message, currentMsg: FreyaMessage | Message | null = originalMsg): boolean | string | Promise<boolean | string> {
        const valid = this.validator ?
            this.validator(val, originalMsg, this, currentMsg) :
            this.type?.validate(val, originalMsg, this, currentMsg!);
        if (!valid || typeof valid === 'string') return this.error || valid;
        if (isPromise(valid)) return valid.then((vld: any) => !vld || typeof vld === 'string' ? this.error || vld : vld);
        return valid;
    }

    public parse(val: string, originalMsg: FreyaMessage | Message, currentMsg: FreyaMessage | Message | null = originalMsg): any | Promise<any> {
        if (this.parser) return this.parser(val, originalMsg, this, currentMsg);
        return this.type?.parse(val, originalMsg, this, currentMsg!);
    }

    public isEmpty(val: string, originalMsg: FreyaMessage | Message, currentMsg: FreyaMessage | Message | null = originalMsg): boolean {
        if (this.emptyChecker) return this.emptyChecker(val, originalMsg, this, currentMsg);
        if (this.type) return this.type.isEmpty(val, originalMsg, this, currentMsg!);
        if (Array.isArray(val)) return val.length === 0;
        return !val;
    }
    private static validateInfo(client: FreyaClient, info: ArgumentInfo) { // eslint-disable-line complexity
        if (!client) throw new Error('The argument client must be specified.');
        if (typeof info !== 'object') throw new TypeError('Argument info must be an Object.');
        if (typeof info.key !== 'string') throw new TypeError('Argument key must be a string.');
        if (info.label && typeof info.label !== 'string') throw new TypeError('Argument label must be a string.');
        if (typeof info.prompt !== 'string') throw new TypeError('Argument prompt must be a string.');
        if (info.error && typeof info.error !== 'string') throw new TypeError('Argument error must be a string.');
        if (info.type && typeof info.type !== 'string') throw new TypeError('Argument type must be a string.');
        if (info.type && !info.type.includes('|') && !client.Registry.Types.has(info.type)) {
            throw new RangeError(`Argument type "${info.type}" isn't registered.`);
        }
        if (!info.type && !info.validate) {
            throw new Error('Argument must have either "type" or "validate" specified.');
        }
        if (info.validate && typeof info.validate !== 'function') {
            throw new TypeError('Argument validate must be a function.');
        }
        if (info.parse && typeof info.parse !== 'function') {
            throw new TypeError('Argument parse must be a function.');
        }
        if (!info.type && (!info.validate || !info.parse)) {
            throw new Error('Argument must have both validate and parse since it doesn\'t have a type.');
        }
        if (typeof info.wait !== 'undefined' && (typeof info.wait !== 'number' || Number.isNaN(info.wait))) {
            throw new TypeError('Argument wait must be a number.');
        }
    }
    private static determineType(client: FreyaClient, id?: string): ArgumentType | null {
        if (!id) return null;
        if (!id.includes('|')) return client.Registry.Types.get(id);

        let type = client.Registry.Types.get(id);
        if (type) return type;
        type = new ArgumentUnionType(client, id);
        client.Registry.registerType(type);
        return type;
    }
}
