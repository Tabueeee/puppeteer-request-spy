import {Overrides, Request, RespondOptions} from 'puppeteer';
import {HttpRequestFactory, RequestInterceptor, RequestModifier, RequestRedirector, ResponseModifier} from '../../src';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {
    getRequestDouble,
    respondingNock
} from '../common/testDoubleFactories';

export module unitTestHelpers {

    export type RequestHandlers = {
        requestSpy: RequestSpy,
        responseFaker: ResponseFaker,
        requestModifier: RequestModifier,
        responseModifier: ResponseModifier,
        requestRedirector: RequestRedirector
    };


    export function getRequestDoubles(): Array<Request> {
        let requestMatchingSpy: Request = <Request> getRequestDouble('spy');
        let requestMatchingFaker: Request = <Request> getRequestDouble('faker');
        let requestMatchingBlocker: Request = <Request> getRequestDouble('blocker');
        let requestMatchingRequestModifier: Request = <Request> getRequestDouble('modifier');
        // noinspection TsLint
        let requestMatchingRequestRedirector: Request = <Request> getRequestDouble('http://www.some-domain.com/requestRedirector', {
            nock: respondingNock.bind(null, 'requestRedirector', 'redirected'),
            requestCount: 3
        });
        let requestMatchingResponseModifier: Request = <Request> getRequestDouble('http://www.example.com/responseModifier', {
            nock: respondingNock.bind(null, 'responseModifier', 'original'),
            requestCount: 3
        });

        return [
            requestMatchingSpy,
            requestMatchingFaker,
            requestMatchingBlocker,
            requestMatchingRequestModifier,
            requestMatchingResponseModifier,
            requestMatchingRequestRedirector
        ];
    }


    export function createRequestHandlers(
        responseFake: RespondOptions,
        overrides: Overrides
    ): RequestHandlers {
        let requestSpy: RequestSpy = new RequestSpy('spy');
        let responseFaker: ResponseFaker = new ResponseFaker('faker', responseFake);
        let requestModifier: RequestModifier = new RequestModifier('modifier', overrides);
        let responseModifier: ResponseModifier = new ResponseModifier(
            new HttpRequestFactory(),
            'responseModifier',
            (originalResponse: Buffer): RespondOptions => {
                return {
                    status: 200,
                    contentType: 'text/html',
                    body: originalResponse.toString().replace(' body', '')
                };
            }
        );

        let requestRedirector: RequestRedirector = new RequestRedirector(
            new HttpRequestFactory(),
            'requestRedirector',
            (request: Request) => {
                return {
                    url: request.url().replace('some-domain', 'example'),
                    options: {
                        status: 200,
                        contentType: 'text/html'
                    }
                };
            }
        );

        return {
            requestSpy,
            responseFaker,
            requestModifier,
            responseModifier,
            requestRedirector
        };
    }

    export function addRequestHandlers(requestInterceptor: RequestInterceptor, requestHandlers: RequestHandlers): void {
        requestInterceptor.block('blocker');
        requestInterceptor.addSpy(requestHandlers.requestSpy);
        requestInterceptor.addFaker(requestHandlers.responseFaker);
        requestInterceptor.addRequestModifier(requestHandlers.requestModifier);
        requestInterceptor.addFaker(requestHandlers.responseModifier);
        requestInterceptor.addFaker(requestHandlers.requestRedirector);
    }

    export function getUrlsFromRequestArray(requests: Array<Request>): Array<string> {
        let arr: Array<string> = [];
        for (let request of requests) {
            arr.push(request.url());
        }

        return arr;
    }

    export async function simulateUsage(requestInterceptor: RequestInterceptor, requestDoubles: Array<Request>): Promise<void> {
        for (let requestDouble of requestDoubles) {
            await requestInterceptor.intercept(requestDouble);
            await requestInterceptor.intercept(requestDouble);
            await requestInterceptor.intercept(requestDouble);
        }
    }
}
