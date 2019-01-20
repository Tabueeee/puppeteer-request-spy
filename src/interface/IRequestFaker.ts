import {Request, RespondOptions} from 'puppeteer';
import {RequestMatcher} from './RequestMatcher';

export interface IResponseFaker {
    /**
     * @param request <Request>: puppeteers Request object to get the url from.
     * @param matcher <(url: string, pattern: string): boolean)>: matches the url with the pattern to block.
     *
     * checks if the RequestFaker matches the Request and will provide a ResponseFake
     */
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;

    /**
     * @param request <Request>: puppeteers Request object
     * @return RespondOptions: RespondOptions as defined by puppeteer
     *
     * provides the ResponseFake to be used by the RequestInterceptor to fake the response of the Fake
     */
    getResponseFake(request: Request): RespondOptions;
}
