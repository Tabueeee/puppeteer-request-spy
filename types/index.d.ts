import { Request } from 'puppeteer';
import { Logger } from './common/Logger';

export declare class RequestInterceptor {
    private requestSpies;
    private responseFakers;
    private urlsToBlock;
    private matcher;
    private logger;
    constructor(matcher: (testString: string, pattern: string) => boolean, logger?: Logger);
    intercept(interceptedUrl: Request): Promise<void>;
    addSpy(requestSpy: RequestSpy): void;
    addFaker(responseFaker: ResponseFaker): void;
    block(urls: Array<string> | string): void;
    clearSpies(): void;
    clearFakers(): void;
    clearUrlsToBlock(): void;
    setUrlsToBlock(urlsToBlock: Array<string>): void;
    private blockUrl(interceptedUrl, url);
    private acceptUrl(interceptedUrl, url);
}

export declare class RequestSpy {
    private hasMatchingUrl;
    private matchedUrls;
    private matchCount;
    private patterns;
    constructor(patterns: Array<string> | string);
    getPatterns(): Array<string>;
    hasMatch(): boolean;
    getMatchedUrls(): Array<string>;
    getMatchCount(): number;
    addMatchedUrl(matchedUrl: string): void;
}

import { RespondOptions } from 'puppeteer';
export declare class ResponseFaker {
    private responseFake;
    private patterns;
    constructor(patterns: Array<string> | string, responseFake: RespondOptions);
    getResponseFake(): RespondOptions;
    getPatterns(): Array<string>;
}
