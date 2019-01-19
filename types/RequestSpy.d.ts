import { Request } from 'puppeteer';
import { IRequestSpy } from './interface/IRequestSpy';
import { RequestMatcher } from './interface/RequestMatcher';
export declare class RequestSpy implements IRequestSpy {
    private hasMatchingUrl;
    private matchCount;
    private patterns;
    private matchedRequests;
    constructor(patterns: Array<string> | string);
    getMatchedRequests(): Array<Request>;
    hasMatch(): boolean;
    addMatch(matchedRequest: Request): void;
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getMatchedUrls(): Array<string>;
    getMatchCount(): number;
}
