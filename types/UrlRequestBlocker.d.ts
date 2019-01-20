import { Request } from 'puppeteer';
import { Matcher } from './interface/Matcher';
import { RequestBlocker } from './interface/RequestBlocker';
export declare class UrlRequestBlocker implements RequestBlocker {
    private urlsToBlock;
    shouldBlockRequest(matcher: Matcher, request: Request): boolean;
    addUrlsToBlock(urls: Array<string> | string): void;
    clearUrlsToBlock(): void;
}
