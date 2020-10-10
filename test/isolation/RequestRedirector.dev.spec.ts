import * as assert from 'assert';
import {Request} from 'puppeteer';
import {HttpRequestFactory} from '../../src/common/HttpRequestFactory';
import {RequestRedirector} from '../../src/RequestRedirector';
import {getHttpRequestFactoryDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('class: RequestRedirector', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                // noinspection TsLint
                new RequestRedirector( 'some-pattern/**/*', (): string => {
                    return '';
                });
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                // noinspection TsLint
                new RequestRedirector(['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'], '');
            });
        });

        it('returns accepted fake', async (): Promise<void> => {
            let requestRedirector: RequestRedirector = new RequestRedirector(
                'some-pattern/**/*',
                (): string => 'some-url'
            );

            let request: Request = <Request> getRequestDouble();

            assert.deepStrictEqual(await requestRedirector.getOverride(request), {
                url: 'some-url',
                method: request.method(),
                headers: request.headers(),
                postData: request.postData()
            });
        });


        it('returns accepted fake', async (): Promise<void> => {
            let requestRedirector: RequestRedirector = new RequestRedirector(
                'some-pattern/**/*',
                'some-url'
            );

            let request: Request = <Request> getRequestDouble();

            assert.deepStrictEqual(await requestRedirector.getOverride(request), {
                url: 'some-url',
                method: request.method(),
                headers: request.headers(),
                postData: request.postData()
            });
        });

        it('returns accepted patterns', (): void => {
            let requestRedirector: RequestRedirector = new RequestRedirector(
                'some-pattern/**/*',
                (): string => 'some-url'
            );

            assert.deepStrictEqual(requestRedirector.getPatterns(), ['some-pattern/**/*']);
        });

        it('confirms request matches when matcher function matches', (): void => {
            let requestRedirector: RequestRedirector = new RequestRedirector(
                'some-pattern/**/*',
                (): string => 'some-url'
            );

            assert.deepStrictEqual(requestRedirector.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let requestRedirector: RequestRedirector = new RequestRedirector(
                'some-pattern/**/*',
                (): string => 'some-url'
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
