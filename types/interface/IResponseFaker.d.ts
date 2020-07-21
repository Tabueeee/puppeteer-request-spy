import { Request, RespondOptions } from 'puppeteer';
import { RequestMatcher } from '../types/RequestMatcher';
export interface IResponseFaker {
    isMatchingRequest(interceptedRequest: Request, matcher: RequestMatcher): Promise<boolean> | boolean;
    getResponseFake(request: Request): RespondOptions | Promise<RespondOptions>;
}
