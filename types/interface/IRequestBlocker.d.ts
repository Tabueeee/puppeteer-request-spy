import { Request } from 'puppeteer';
import { RequestMatcher } from './RequestMatcher';
export interface IRequestBlocker {
    shouldBlockRequest(request: Request, matcher: RequestMatcher): boolean;
    clearUrlsToBlock(): void;
    addUrlsToBlock(urlsToBlock: Array<string> | string): void;
}
