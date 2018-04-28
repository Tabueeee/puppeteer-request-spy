import {Request, RespondOptions} from 'puppeteer';
import {Logger} from './common/Logger';

export declare abstract class RequestInspector {
    private patterns;

    constructor(patterns: Array<string> | string);

    getPatterns(): Array<string>;
}

/**
 *  @description The RequestInterceptor will match any intercepted request against the matcher function and notify all spies with a matching pattern and block requests matching any pattern in urlsToBlock.
 **/
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

/**
 *  @description RequestSpy is used to count and verify intercepted requests matching a specific pattern.
 **/
export declare class RequestSpy extends RequestInspector {
    private hasMatchingUrl;
    private matchedUrls;
    private matchCount;

    constructor(patterns: Array<string> | string);

    hasMatch(): boolean;

    getMatchedUrls(): Array<string>;

    getMatchCount(): number;

    addMatchedUrl(interceptedRequest: string): void;
}

/**
 *  @description RequestFaker is used to provide a fake response when matched to a specific pattern.
 **/
export declare class ResponseFaker extends RequestInspector {
    private responseFake;

    constructor(patterns: Array<string> | string, responseFake: RespondOptions);

    getResponseFake(): RespondOptions;
}
