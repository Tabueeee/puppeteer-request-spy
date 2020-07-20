import {Overrides, Request} from 'puppeteer';
import {RequestMatcher} from '../types/RequestMatcher';

export interface IRequestModifier {
    /**
     * @param request <Request>: puppeteers Request object to get the url from.
     * @param matcher <(url: string, pattern: string): Promise<boolean> | boolean)>: matches the url with the pattern to block.
     *
     * checks if the RequestFaker matches the Request and will provide a ResponseFake
     */
    isMatchingRequest(request: Request, matcher: RequestMatcher): Promise<boolean> | boolean;
    getOverride(interceptedRequest: Request): Promise<Overrides> | Overrides;
}

// url <string> If set, the request url will be changed
// method <string> If set changes the request method (e.g. GET or POST)
// postData <string> If set changes the post data of request
// headers
