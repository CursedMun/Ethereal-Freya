import { injectable } from "inversify";

@injectable()
export class RegexService {

    private regexp = 'ping';

    public isPing(stringToSearch: string): boolean {
        return stringToSearch.search(this.regexp) >= 0;
    }
}