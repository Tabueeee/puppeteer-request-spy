import { Request } from 'puppeteer';
import { ILogger } from './common/Logger';
import { IRequestBlocker } from './interface/IRequestBlocker';
import { IResponseFaker } from './interface/IRequestFaker';
import { IRequestSpy } from './interface/IRequestSpy';
import { RequestMatcher } from './interface/RequestMatcher';
export declare class RequestInterceptor {
    private requestSpies;
    private responseFakers;
    private matcher;
    private logger;
    private urlAccessor;
    private requestBlocker;
    constructor(matcher: RequestMatcher, logger?: ILogger);
    intercept(interceptedRequest: Request): Promise<void>;
    addSpy(requestSpy: IRequestSpy): void;
    addFaker(responseFaker: IResponseFaker): void;
    block(urlsToBlock: Array<string> | string): void;
    clearSpies(): void;
    clearFakers(): void;
    clearUrlsToBlock(): void;
    setUrlsToBlock(urlsToBlock: Array<string>): void;
    setRequestBlocker(requestBlocker: IRequestBlocker): void;
    private getUrlAccessor;
    private getMatchingFaker;
    private matchSpies;
    private blockUrl;
    private acceptUrl;
}
