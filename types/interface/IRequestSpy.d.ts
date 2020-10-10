import { Request } from 'puppeteer';
import { RequestMatcher } from '../types/RequestMatcher';
export interface IRequestSpy {
    isMatchingRequest(request: Request, matcher: RequestMatcher): Promise<boolean> | boolean;
    addMatch(matchedRequest: Request): Promise<void> | void;
}
