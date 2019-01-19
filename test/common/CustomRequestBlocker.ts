import {RequestBlocker} from '../../src/interface/RequestBlocker';

export class CustomRequestBlocker implements RequestBlocker {

    public shouldBlockRequest(): boolean {
        return true;
    }

    public clearUrlsToBlock(): void {
        return undefined;
    }

    public addUrlsToBlock(): void {
        return undefined;
    }
}
