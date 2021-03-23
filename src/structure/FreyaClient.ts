import { Client, Collection, DiscordAPIError } from "discord.js";
import { FileType, IFreyaOptions } from '../helpers/Types';
import { Store } from "./Store";
export class FreyaClient extends Client {
 
    public folders: { [key: string]: {path: string , files:string[]}};
    public prefix: "!" | ".";
    public commands: Collection<string,Object>;
    constructor(opts: IFreyaOptions, token: string = "") {
        var myOptions = {
            prefix: opts.prefix,
            folders: opts.folders,
            token: token
        }
        super(opts)
        this.token = myOptions.token
        this.folders = {
            ...myOptions.folders
        }
        this.prefix = opts.prefix ?? "!";
        new Store(this, FileType["Commands"]);
        new Store(this, FileType["Events"]);
        this.login(this.token);
    }
}