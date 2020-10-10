import {Request} from 'puppeteer';
import {RequestMatcher} from '../types/RequestMatcher';

export interface IRequestSpy {
    /**
     * @param request <Request>: puppeteers Request object to get the url from.
     * @param matcher <(url: string, pattern: string): Promise<boolean> | boolean)>: matches the url with the pattern to block.
     *
     * checks if the RequestSpy matches the Request.
     */
    isMatchingRequest(request: Request, matcher: RequestMatcher): Promise<boolean> | boolean;
    /**
     * React to requests.
     * @param matchedRequest - The request to react to
     */
    addMatch(matchedRequest: Request): Promise<void> | void;
}
