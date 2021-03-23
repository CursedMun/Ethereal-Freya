import { ClientOptions } from "discord.js";

export type IFreyaOptions = {
    prefix: "!" | ".",
    folders: { [key: string]: { path: string, files: string[] } }
    //Todo
} & ClientOptions
// export interface FileTypes {
//     [key: string]: "commands" | "events"
// }
export const FileType: {
    [key: string]: "Commands" | "Events"
} = {
    Commands: "Commands",
    Events: "Events"
}