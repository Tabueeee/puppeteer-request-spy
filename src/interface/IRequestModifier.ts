import {Overrides, Request} from 'puppeteer';
import {RequestMatcher} from '../types/RequestMatcher';

export interface IRequestModifier {
    isMatchingRequest(interceptedRequest: Request, matcher: RequestMatcher): boolean;
    getOverride(interceptedRequest: Request): Overrides;
}

// url <string> If set, the request url will be changed
// method <string> If set changes the request method (e.g. GET or POST)
// postData <string> If set changes the post data of request
// headers
