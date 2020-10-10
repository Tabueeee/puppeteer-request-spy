import { Overrides, Request } from 'puppeteer';
import { IRequestModifier } from './interface/IRequestModifier';
import { RequestMatcher } from './types/RequestMatcher';
export declare class RequestRedirector implements IRequestModifier {
    private patterns;
    private redirectionUrlFactory;
    constructor(patterns: Array<string> | string, redirectionUrl: ((request: Request) => Promise<string> | string) | string);
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getPatterns(): Array<string>;
    getOverride(interceptedRequest: Request): Promise<Overrides>;
}
