import {Request, RespondOptions} from 'puppeteer';
import {HttpRequestFactory} from './common/HttpRequestFactory';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {IRedirectionOptions} from './interface/IRedirectionOptions';
import {IResponseFaker} from './interface/IResponseFaker';
import {RedirectionOptionFactory} from './types/RedirectionOptionFactory';
import {RequestMatcher} from './types/RequestMatcher';

export class RequestRedirector implements IResponseFaker {
    private patterns: Array<string>;
    private redirectionOptionFactory: RedirectionOptionFactory;
    private httpRequestFactory: HttpRequestFactory;

    public constructor(
        httpRequestFactory: HttpRequestFactory,
        patterns: Array<string> | string,
        redirectionOptionFactory: RedirectionOptionFactory
    ) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.redirectionOptionFactory = redirectionOptionFactory;
        this.httpRequestFactory = httpRequestFactory;
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

    public async getResponseFake(request: Request): Promise<RespondOptions> {
        let redirectionOptions: IRedirectionOptions = this.redirectionOptionFactory(request);
        let response: Buffer = await this.httpRequestFactory.createResponseLoader(request, redirectionOptions.url)();

        return Object.assign({}, redirectionOptions.options, {body: response.toString()});
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }
}
