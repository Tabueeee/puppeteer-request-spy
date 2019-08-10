import {Overrides, Request} from 'puppeteer';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {IRequestModifier} from './interface/IRequestModifier';
import {RequestMatcher} from './types/RequestMatcher';

export class RequestModifier implements IRequestModifier {
    private patterns: Array<string>;
    private requestOverride: Overrides;

    public constructor(patterns: Array<string> | string, requestOverride: Overrides) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.requestOverride = requestOverride;
    }

    public getOverride(): Overrides {
        return this.requestOverride;
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
}
