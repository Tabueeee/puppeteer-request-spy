import { Overrides, Request } from 'puppeteer';
import { RequestMatcher } from '../types/RequestMatcher';
export interface IRequestModifier {
    isMatchingRequest(interceptedRequest: Request, matcher: RequestMatcher): Promise<boolean> | boolean;
    getOverride(interceptedRequest: Request): Promise<Overrides> | Overrides;
}
