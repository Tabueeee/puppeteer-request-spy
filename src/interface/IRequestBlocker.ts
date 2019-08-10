import {Request} from 'puppeteer';
import {RequestMatcher} from '../types/RequestMatcher';

export interface IRequestBlocker {
    /**
     * @param request <Request>: request to get the url from.
     * @param matcher <(url: string, pattern: string): boolean)>: matches the url with the pattern to block.
     *
     * determines if a request should be blocked.
     */
    shouldBlockRequest(request: Request, matcher: RequestMatcher): boolean;

    /**
     * removes all patterns added to the RequestBlocker.
     */
    clearUrlsToBlock(): void;

    /**
     * adds new patterns to the RequestBlocker.
     */
    addUrlsToBlock(urlsToBlock: Array<string> | string): void;
}
