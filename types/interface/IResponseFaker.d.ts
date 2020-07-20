import { Request, RespondOptions } from 'puppeteer';
import { RequestMatcher } from '../types/RequestMatcher';
export interface IResponseFaker {
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean | Promise<boolean>;
    getResponseFake(request: Request): RespondOptions | Promise<RespondOptions>;
}
