import { Overrides, Request } from 'puppeteer';
import { RequestMatcher } from '../types/RequestMatcher';
export interface IRequestModifier {
    isMatchingRequest(interceptedRequest: Request, matcher: RequestMatcher): boolean;
    getOverride(interceptedRequest: Request): Overrides;
}
