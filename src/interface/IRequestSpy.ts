import {Request} from 'puppeteer';
import {RequestMatcher} from './RequestMatcher';

export interface IRequestSpy {
    /**
     * @param request <Request>: request to get the url from.
     * @param matcher <(url: string, pattern: string): boolean)>: matches the url with the pattern to block.
     *
     * checks if the RequestSpy matches the Request.
     */
    isMatchingRequest(request: Request, matcher: RequestMatcher): boolean;
    /**
     * React to requests.
     * @param matchedRequest - The request to react to
     */
    addMatch(matchedRequest: Request): void;
}
