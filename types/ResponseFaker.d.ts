import { Request, RespondOptions } from 'puppeteer';
import { IResponseFaker } from './interface/IResponseFaker';
import { RequestMatcher } from './types/RequestMatcher';
export declare class ResponseFaker implements IResponseFaker {
    private patterns;
    private responseFakeFactory;
    constructor(patterns: Array<string> | string, responseFake: ((request: Request) => RespondOptions | Promise<RespondOptions>) | RespondOptions);
    getResponseFake(request: Request): Promise<RespondOptions>;
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getPatterns(): Array<string>;
}
