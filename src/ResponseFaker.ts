import {Request, RespondOptions} from 'puppeteer';
import {resolveOptionalPromise} from './common/resolveOptionalPromise';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {IResponseFaker} from './interface/IResponseFaker';
import {RequestMatcher} from './types/RequestMatcher';

export class ResponseFaker implements IResponseFaker {
    private patterns: Array<string> = [];
    private responseFakeFactory: (request: Request) => RespondOptions | Promise<RespondOptions>;

    public constructor(
        patterns: Array<string> | string,
        responseFake: ((request: Request) => RespondOptions | Promise<RespondOptions>) | RespondOptions
    ) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.responseFakeFactory = typeof responseFake === 'function' ? responseFake : (): RespondOptions => responseFake;
    }

    public async getResponseFake(request: Request): Promise<RespondOptions> {
        return await resolveOptionalPromise(this.responseFakeFactory(request));
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
