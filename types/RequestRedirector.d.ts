import { Request, RespondOptions } from 'puppeteer';
import { HttpRequestFactory } from './common/HttpRequestFactory';
import { IResponseFaker } from './interface/IResponseFaker';
import { RedirectionOptionFactory } from './types/RedirectionOptionFactory';
import { RequestMatcher } from './types/RequestMatcher';
export declare class RequestRedirector implements IResponseFaker {
    private patterns;
    private redirectionOptionFactory;
    private httpRequestFactory;
    constructor(httpRequestFactory: HttpRequestFactory, patterns: Array<string> | string, redirectionOptionFactory: RedirectionOptionFactory);
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getResponseFake(request: Request): Promise<RespondOptions>;
    getPatterns(): Array<string>;
}
