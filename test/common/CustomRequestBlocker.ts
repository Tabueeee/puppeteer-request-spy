import {IRequestBlocker} from '../../src/interface/IRequestBlocker';

export class CustomRequestBlocker implements IRequestBlocker {

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
