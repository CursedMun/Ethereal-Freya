
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

export class CommandHandler {
    private client: FreyaClient
    constructor(client: FreyaClient) {
        this.client = client
        this.exec()
    }
    exec() {
        try {
          for (let i = 0; i < Object.keys(this.client.folders).length; i++) {
            const element = this.client.folders[i];
            element.files.forEach(file =>{
              this.client.comman
            })
        
          }
            return this;
        } catch (err) {
            Logger.error(err);
        }
    }
};
