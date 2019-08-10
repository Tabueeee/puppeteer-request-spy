import { Request } from 'puppeteer';
import { RequestMatcher } from '../types/RequestMatcher';
export interface IRequestSpy {
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    addMatch(matchedRequest: Request): void;
}
