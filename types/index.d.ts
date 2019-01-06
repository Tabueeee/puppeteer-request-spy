import { Request } from 'puppeteer';
import { Logger } from './common/Logger';

export declare class RequestInterceptor {
    private requestSpies;
    private responseFakers;
    private urlsToBlock;
    private matcher;
    private logger;
    private urlAccessor;
    constructor(matcher: (testString: string, pattern: string) => boolean, logger?: Logger);
    intercept(interceptedRequest: Request): Promise<void>;
    addSpy(requestSpy: RequestSpy): void;
    addFaker(responseFaker: ResponseFaker): void;
    block(urls: Array<string> | string): void;
    clearSpies(): void;
    clearFakers(): void;
    clearUrlsToBlock(): void;
    setUrlsToBlock(urlsToBlock: Array<string>): void;
    private getUrlAccessor;
    private getMatchingResponseFaker;
    private shouldBlockRequest;
    private matchSpies;
    private blockUrl;
    private acceptUrl;
}

export declare class RequestSpy {
    private hasMatchingUrl;
    private matchCount;
    private patterns;
    private matches;
    constructor(patterns: Array<string> | string);
    getPatterns(): Array<string>;
    getMatchedRequests(): Array<Request>;
    hasMatch(): boolean;
    addMatch(matchedRequest: Request): void;
    getMatchedUrls(): Array<string>;
    getMatchCount(): number;
}

import { RespondOptions } from 'puppeteer';
export declare class ResponseFaker {
    private responseFake;
    private patterns;
    constructor(patterns: Array<string> | string, responseFake: RespondOptions);
    getResponseFake(): RespondOptions;
    getPatterns(): Array<string>;
}
