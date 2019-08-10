import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';
import {HttpRequestFactory, IRedirectionOptions} from '../../src';
import {RequestRedirector} from '../../src/RequestRedirector';
import {getHttpRequestFactoryDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('class: RequestRedirector', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
                // noinspection TsLint
                new RequestRedirector(httpRequestFactory, 'some-pattern/**/*', (): any => {
                    return {};
                });
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
                // noinspection TsLint
                new RequestRedirector(httpRequestFactory, ['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'], (): any => {
                    return {};
                });
            });
        });

        it('returns accepted fake', async (): Promise<void> => {
            let spy: SinonSpy = sinon.spy();
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble(
                '<html><body>hello world!</body></html>', spy);
            let requestRedirector: RequestRedirector = new RequestRedirector(
                httpRequestFactory,
                'some-pattern/**/*',
                (): IRedirectionOptions => {
                    return {
                        url: 'some-url',
                        options: {
                            status: 200,
                            contentType: 'text/html'
                        }
                    };
                }
            );

            let request: Request = <Request> getRequestDouble();

            assert.deepStrictEqual(await requestRedirector.getResponseFake(request), {
                status: 200,
                contentType: 'text/html',
                body: '<html><body>hello world!</body></html>'
            });

            sinon.assert.calledWithExactly(spy, request, 'some-url');
        });

        it('returns accepted patterns', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            let requestRedirector: RequestRedirector = new RequestRedirector(
                httpRequestFactory,
                'some-pattern/**/*',
                (): IRedirectionOptions => {
                    return {
                        url: 'some-url',
                        options: {}
                    };
                }
            );

            assert.deepStrictEqual(requestRedirector.getPatterns(), ['some-pattern/**/*']);
        });

        it('confirms request matches when matcher function matches', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            let requestRedirector: RequestRedirector = new RequestRedirector(
                httpRequestFactory,
                'some-pattern/**/*',
                (): IRedirectionOptions => {
                    return {
                        url: 'some-url',
                        options: {}
                    };
                }
            );

            assert.deepStrictEqual(requestRedirector.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            let requestRedirector: RequestRedirector = new RequestRedirector(
                httpRequestFactory,
                'some-pattern/**/*',
                (): IRedirectionOptions => {
                    return {
                        url: 'some-url',
                        options: {}
                    };
                }
            );

            assert.deepStrictEqual(requestRedirector.isMatchingRequest((<Request>{url: (): string => ''}), () => false), false);
        });
    });

    describe('sad path', (): void => {
        it('rejects other input', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            assert.throws((): void => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestRedirector(httpRequestFactory, 3, {}).getPatterns();
            });
        });
    });
});
