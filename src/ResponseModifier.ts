import {Request, RespondOptions} from 'puppeteer';
import {HttpRequestFactory} from './common/HttpRequestFactory';
import {resolveOptionalPromise} from './common/resolveOptionalPromise';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {IResponseFaker} from './interface/IResponseFaker';
import {RequestMatcher} from './types/RequestMatcher';
import {ResponseModifierCallBack} from './types/ResponseModifierCallBack';

export class ResponseModifier implements IResponseFaker {
    private patterns: Array<string>;
    private responseModifierCallBack: ResponseModifierCallBack;
    private httpRequestFactory: HttpRequestFactory;

    public constructor(
        patterns: Array<string> | string,
        responseModifierCallBack: ResponseModifierCallBack,
        httpRequestFactory: HttpRequestFactory = (new HttpRequestFactory())
    ) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.responseModifierCallBack = responseModifierCallBack;
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
        let originalResponse: RespondOptions = {};
        let error: Error | undefined;
        let body: string;

        try {
            originalResponse = await this.httpRequestFactory.createOriginalResponseLoaderFromRequest(request)();
            body = <string> originalResponse.body;
        } catch (err) {
            error = <Error> err;
            body = '';
        }

        return Object.assign(
            {},
            originalResponse,
            {
                body: await resolveOptionalPromise(this.responseModifierCallBack(
                    error,
                    body,
                    request
                ))
            }
        );
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }
}
