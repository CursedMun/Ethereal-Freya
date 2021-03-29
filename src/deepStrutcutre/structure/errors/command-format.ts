import { FreyaMessage } from '../extensions/message';
import { FriendlyError } from './friendly';

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
export class CommandFormatError extends FriendlyError {
    constructor(msg: FreyaMessage) {
        super(
            `Invalid command usage. The \`${msg.Command?.Name}\` command's accepted format is: ${msg.usage(
                msg.Command?.Format ?? "",
                msg.guild ? undefined : null,
                msg.guild ? undefined : null
            )}. Use ${msg.anyUsage(
                `help ${msg.Command?.Name}`,
                "",
                msg.guild ? undefined : null
            )} for more information.`
        );
        this.name = 'CommandFormatError';
    }
}
