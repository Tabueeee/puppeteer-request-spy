import { Request } from 'puppeteer';
import { Logger } from './common/Logger';
export declare class RequestInterceptor {
    private spies;
    private urlsToBlock;
    private matcher;
    private logger;
    constructor(matcher: (testString: string, pattern: string) => boolean, logger?: Logger);
    intercept(interceptedUrl: Request): void;
    addSpy(requestSpy: RequestSpy): void;
    block(urls: Array<string> | string): void;
    clearSpies(): void;
    clearUrlsToBlock(): void;
    setUrlsToBlock(urlsToBlock: Array<string>): void;
    private blockUrl(interceptedUrl);
    private acceptUrl(interceptedUrl);
}
export declare class RequestSpy {
    private hasMatchingUrl;
    private matchedUrls;
    private matchCount;
    private patterns;
    constructor(patterns: Array<string> | string);
    hasMatch(): boolean;
    getMatchedUrls(): Array<string>;
    getMatchCount(): number;
    addMatchedUrl(interceptedRequest: string): void;
    getPatterns(): Array<string>;
}
