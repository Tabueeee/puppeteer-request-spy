import { Request, RespondOptions } from 'puppeteer';
import { RequestMatcher } from './RequestMatcher';
export interface IResponseFaker {
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getResponseFake(request: Request): RespondOptions;
}
