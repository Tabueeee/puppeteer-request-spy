import { Request } from 'puppeteer';
import { IRequestBlocker } from './interface/IRequestBlocker';
import { RequestMatcher } from './types/RequestMatcher';
export declare class RequestBlocker implements IRequestBlocker {
    private urlsToBlock;
    shouldBlockRequest(request: Request, matcher: RequestMatcher): boolean;
    addUrlsToBlock(urls: Array<string> | string): void;
    clearUrlsToBlock(): void;
}
