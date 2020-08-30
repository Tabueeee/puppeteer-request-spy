import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {HttpRequestFactory} from '../../src/common/HttpRequestFactory';
import {ResponseModifier} from '../../src/ResponseModifier';
import {getHttpRequestFactoryDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('class: ResponseModifier', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>getHttpRequestFactoryDouble('any-response');
                // noinspection TsLint
                new ResponseModifier(
                    'some-pattern/**/*',
                    (): any => {
                        return {};
                    },
                    httpRequestFactory
                );
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                // noinspection TsLint
                new ResponseModifier(
                    ['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'],
                    (): any => {
                        return {};
                    }
                );
            });
        });

        it('returns accepted fake', async (): Promise<void> => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>getHttpRequestFactoryDouble('payload');
            let responseModifier: ResponseModifier = new ResponseModifier(
                'some-pattern/**/*',
                (err: Error | undefined, response: string): string => err ? err.toString() : `${response}1`,
                httpRequestFactory
            );

            let request: Request = <Request>getRequestDouble();

            assert.deepStrictEqual(await responseModifier.getResponseFake(request), {
                status: 200,
                contentType: 'text/plain',
                body: 'payload1'
            });
        });

        it('returns accepted patterns', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>getHttpRequestFactoryDouble('any-response');
            let responseModifier: ResponseModifier = new ResponseModifier(
                'some-pattern/**/*',
                (): string => 'payload',
                httpRequestFactory
            );

            assert.deepStrictEqual(responseModifier.getPatterns(), ['some-pattern/**/*']);
        });

        it('confirms request matches when matcher function matches', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>getHttpRequestFactoryDouble('any-response');
            let responseModifier: ResponseModifier = new ResponseModifier(
                'some-pattern/**/*',
                (): string => 'payload',
                httpRequestFactory
            );

            assert.deepStrictEqual(responseModifier.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>getHttpRequestFactoryDouble('any-response');
            let responseModifier: ResponseModifier = new ResponseModifier(
                'some-pattern/**/*',
                (): string => 'payload',
                httpRequestFactory
            );

            assert.deepStrictEqual(responseModifier.isMatchingRequest((<Request>{url: (): string => ''}), () => false), false);
        });
    });

    describe('sad path', (): void => {
        it('rejects other input', (): void => {
            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>getHttpRequestFactoryDouble('any-response');
            assert.throws((): void => {
                // @ts-ignore: ignore error to test invalid input from js
                new ResponseModifier(httpRequestFactory, 3, {}).getPatterns();
            });
        });

        it('passes error when resource is unavailable', async (): Promise<void> => {
            let expectedError: Error = new Error('ERROR!');

            let httpRequestFactory: HttpRequestFactory = <HttpRequestFactory>(<unknown>{
                createOriginalResponseLoaderFromRequest: () => () => Promise.reject(expectedError)
            });

            let modifierCallbackSpy: sinon.SinonSpy = sinon.spy();

            let responseModifier: ResponseModifier = new ResponseModifier(
                'some-pattern/**/*',
                (err: Error | undefined, body: string) => {
                    modifierCallbackSpy(err, body);

                    return err ? 'oh no!' : body;
                },
                httpRequestFactory
            );


            let request: Request = <Request>getRequestDouble();

            assert.deepStrictEqual(await responseModifier.getResponseFake(request), {
                body: 'oh no!'
            });
            sinon.assert.callCount(modifierCallbackSpy, 1);
            sinon.assert.calledWithExactly(modifierCallbackSpy, expectedError, '');
        });
    });
});
