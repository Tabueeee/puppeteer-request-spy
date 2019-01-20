import { Request } from 'puppeteer';
import { Matcher } from './Matcher';
export interface Spy {
    isMatch(matcher: Matcher, request: Request): boolean;
    addMatch(matchedRequest: Request): void;
}
