import {Overrides, Request} from 'puppeteer';
import {resolveOptionalPromise} from './common/resolveOptionalPromise';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {IRequestModifier} from './interface/IRequestModifier';
import {RequestMatcher} from './types/RequestMatcher';

export class RequestRedirector implements IRequestModifier {
    private patterns: Array<string>;
    private redirectionUrlFactory: ((request: Request) => string | Promise<string>);

    public constructor(
        patterns: Array<string> | string,
        redirectionUrl: ((request: Request) => Promise<string> | string) | string
    ) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.redirectionUrlFactory = typeof redirectionUrl === 'function'
                                        ? redirectionUrl
                                        : (): string => redirectionUrl;
    }

    public isMatchingRequest(request: Request, matcher: RequestMatcher): boolean {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(request);
        for (let pattern of this.patterns) {
            if (matcher(urlAccessor.getUrlFromRequest(request), pattern)) {
                return true;
            }
        }

        return false;
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }

    public async getOverride(interceptedRequest: Request): Promise<Overrides> {
        return {
            url: (await resolveOptionalPromise<string>(this.redirectionUrlFactory(interceptedRequest))),
            method: interceptedRequest.method(),
            headers: interceptedRequest.headers(),
            postData: interceptedRequest.postData()
        };
    }
}
