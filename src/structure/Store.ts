
import { existsSync, mkdir, mkdirSync } from 'fs';
import { glob } from 'glob';
import 'path';
import { Logger } from '../helpers/Logger';
import { FreyaClient } from './FreyaClient';

interface File {
    path: string,
    name: string,
    folder: string,
    dir: string,
}

export class Store {
    private client: FreyaClient
    public type: string
    public folderPath: string
    public files: string[]
    constructor(client: FreyaClient, type: string) {
        this.client = client
        this.type = type
        this.folderPath = this.client.folders[this.type].path
        this.exec(this.folderPath)
    }
    exec(foldername) {
        try {
            if (!existsSync(foldername)) mkdirSync(foldername)
            glob(foldername, (err, res) => {
                this.client.folders[this.type].files = res.filter(x => x.endsWith(".js"))
            })
            return this;
        } catch (err) {
            Logger.error(err);
        }
    }
};
