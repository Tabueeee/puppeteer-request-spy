import {Request} from 'puppeteer';
import {Matcher} from './Matcher';

export interface RequestBlocker {
    shouldBlockRequest(matcher: Matcher, request: Request): boolean;

    clearUrlsToBlock(): void;

    addUrlsToBlock(urlsToBlock: Array<string> | string): void;
}
