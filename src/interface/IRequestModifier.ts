import {Overrides, Request} from 'puppeteer';
import {RequestMatcher} from '../types/RequestMatcher';

export interface IRequestModifier {
    /**
     * @param interceptedRequest <Request>: puppeteers Request object to get the url from.
     * @param matcher <(url: string, pattern: string): Promise<boolean> | boolean)>: matches the url with the pattern to block.
     *
     * checks if the RequestFaker matches the Request and will provide a ResponseFake
     */
    isMatchingRequest(interceptedRequest: Request, matcher: RequestMatcher): Promise<boolean> | boolean;

    /**
     * @param interceptedRequest <Request>: puppeteers Request object
     * @return Overrides: Overrides as defined by puppeteer
     *
     * provides the RequestOverrides to be used by the RequestInterceptor to modify the request
     */
    getOverride(interceptedRequest: Request): Promise<Overrides> | Overrides;
}
