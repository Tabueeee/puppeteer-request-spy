import { Request, RespondOptions } from 'puppeteer';
import { IResponseFaker } from './interface/IRequestFaker';
import { RequestMatcher } from './interface/RequestMatcher';
export declare class ResponseFaker implements IResponseFaker {
    private responseFake;
    private patterns;
    constructor(patterns: Array<string> | string, responseFake: RespondOptions);
    getResponseFake(): RespondOptions;
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getPatterns(): Array<string>;
}
