import {Request, RespondOptions} from 'puppeteer';
import {RequestMatcher} from '../types/RequestMatcher';

export interface IResponseFaker {
    /**
     * @param interceptedRequest <Request>: puppeteers Request object to get the url from.
     * @param matcher <(url: string, pattern: string): Promise<boolean> | boolean)>: matches the url with the pattern to block.
     *
     * checks if the RequestFaker matches the Request and will provide a ResponseFake
     */
    isMatchingRequest(interceptedRequest: Request, matcher: RequestMatcher): Promise<boolean> | boolean;

    /**
     * @param request <Request>: puppeteers Request object
     * @return RespondOptions: RespondOptions as defined by puppeteer
     *
     * provides the ResponseFake to be used by the RequestInterceptor to fake the response of the request
     */
    getResponseFake(request: Request): RespondOptions | Promise<RespondOptions>;
}
