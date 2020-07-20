import { Overrides, Request } from 'puppeteer';
import { IRequestModifier } from './interface/IRequestModifier';
import { RequestMatcher } from './types/RequestMatcher';
export declare class RequestModifier implements IRequestModifier {
    private patterns;
    private requestOverride;
    constructor(patterns: Array<string> | string, requestOverride: Overrides);
    getOverride(): Overrides;
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getPatterns(): Array<string>;
}
