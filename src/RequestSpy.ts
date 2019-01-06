import {Request} from 'puppeteer';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';

export class RequestSpy {

    private hasMatchingUrl: boolean = false;
    private matchCount: number = 0;
    private patterns: Array<string> = [];
    private matchedRequests: Array<Request> = [];

    public constructor(patterns: Array<string> | string) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }

    public getMatchedRequests(): Array<Request> {
        return this.matchedRequests;
    }

    public hasMatch(): boolean {
        return this.hasMatchingUrl;
    }

    public addMatch(matchedRequest: Request): void {
        this.hasMatchingUrl = true;
        this.matchedRequests.push(matchedRequest);
        this.matchCount++;
    }

    public getMatchedUrls(): Array<string> {
        let matchedUrls: Array<string> = [];
        for (let match of this.matchedRequests) {
            let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(match);

            let url: string = urlAccessor.getUrlFromRequest(match);
            matchedUrls.push(url);
        }

        return matchedUrls;
    }

    public getMatchCount(): number {
        return this.matchCount;
    }
}
