import * as assert from 'assert';
import {Request} from 'puppeteer';
import {HttpRequestFactory} from '../../src';
import {ResponseModifier} from '../../src/ResponseModifier';
import {getHttpRequestFactoryDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('class: ResponseModifier', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
                // noinspection TsLint
                new ResponseModifier(httpRequestFactory, 'some-pattern/**/*', (): any => {
                    return {};
                });
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
                // noinspection TsLint
                new ResponseModifier(httpRequestFactory, ['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'], (): any => {
                    return {};
                });
            });
        });

        it('returns accepted fake', async (): Promise<void> => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('payload');
            let responseModifier: ResponseModifier = new ResponseModifier(
                httpRequestFactory,
                'some-pattern/**/*',
                (response: string): string => `${response}1`
            );

            let request: Request = <Request> getRequestDouble();

            assert.deepStrictEqual(await responseModifier.getResponseFake(request), {
                status: 200,
                contentType: 'text/plain',
                body: 'payload1'
            });
        });

        it('returns accepted patterns', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            let responseModifier: ResponseModifier = new ResponseModifier(
                httpRequestFactory,
                'some-pattern/**/*',
                (): string => 'payload'
            );

            assert.deepStrictEqual(responseModifier.getPatterns(), ['some-pattern/**/*']);
        });

        it('confirms request matches when matcher function matches', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            let responseModifier: ResponseModifier = new ResponseModifier(
                httpRequestFactory,
                'some-pattern/**/*',
                (): string => 'payload'
            );

            assert.deepStrictEqual(responseModifier.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            let responseModifier: ResponseModifier = new ResponseModifier(
                httpRequestFactory,
                'some-pattern/**/*',
                (): string => 'payload'
            );

            assert.deepStrictEqual(responseModifier.isMatchingRequest((<Request>{url: (): string => ''}), () => false), false);
        });
    });

    describe('sad path', (): void => {
        it('rejects other input', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory> getHttpRequestFactoryDouble('any-response');
            assert.throws((): void => {
                // @ts-ignore: ignore error to test invalid input from js
                new ResponseModifier(httpRequestFactory, 3, {}).getPatterns();
            });
        });
    });
});
