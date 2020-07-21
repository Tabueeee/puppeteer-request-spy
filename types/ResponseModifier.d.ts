import { Request, RespondOptions } from 'puppeteer';
import { HttpRequestFactory } from './common/HttpRequestFactory';
import { IResponseFaker } from './interface/IResponseFaker';
import { RequestMatcher } from './types/RequestMatcher';
import { ResponseModifierCallBack } from './types/ResponseModifierCallBack';
export declare class ResponseModifier implements IResponseFaker {
    private patterns;
    private responseModifierCallBack;
    private httpRequestFactory;
    constructor(patterns: Array<string> | string, responseModifierCallBack: ResponseModifierCallBack, httpRequestFactory?: HttpRequestFactory);
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    getResponseFake(request: Request): Promise<RespondOptions>;
    getPatterns(): Array<string>;
}
