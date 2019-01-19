import {Request, RespondOptions} from 'puppeteer';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {Faker} from './interface/Faker';
import {Matcher} from './interface/Matcher';

export class ResponseFaker implements Faker {

    private responseFake: RespondOptions;
    private patterns: Array<string> = [];

    public constructor(patterns: Array<string> | string, responseFake: RespondOptions) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.responseFake = responseFake;
    }

    public getResponseFake(): RespondOptions {
        return this.responseFake;
    }

    public isMatch(matcher: Matcher, request: Request): boolean {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(request);
        for (let pattern of this.patterns) {
            if (matcher(urlAccessor.getUrlFromRequest(request), pattern)) {
                return true;
            }
        }

        return false;
    }
}
