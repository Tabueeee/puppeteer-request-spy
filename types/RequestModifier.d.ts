import { Overrides, Request } from 'puppeteer';
import { IRequestModifier } from './interface/IRequestModifier';
import { RequestMatcher } from './types/RequestMatcher';
export declare class RequestModifier implements IRequestModifier {
    private patterns;
    private requestOverrideFactory;
    constructor(patterns: Array<string> | string, requestOverride: ((request: Request) => Promise<Overrides> | Overrides) | Overrides);
    getOverride(request: Request): Promise<Overrides>;
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getPatterns(): Array<string>;
}
