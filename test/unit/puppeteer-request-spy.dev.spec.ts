import * as assert from 'assert';
import * as nock from 'nock';
import {Overrides, Request, RespondOptions} from 'puppeteer';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';
import {HttpRequestFactory, RequestMatcher, RequestModifier, RequestRedirector, ResponseModifier} from '../../src';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {unitTestHelpers} from './unitTestHelpers';
import getRequestDoubles = unitTestHelpers.getRequestDoubles;
import createRequestHandlers = unitTestHelpers.createRequestHandlers;
import addRequestHandlers = unitTestHelpers.addRequestHandlers;
import RequestHandlers = unitTestHelpers.RequestHandlers;
import simulateUsage = unitTestHelpers.simulateUsage;
import getUrlsFromRequestArray = unitTestHelpers.getUrlsFromRequestArray;

describe('unit', async (): Promise<void> => {
    let requestInterceptor: RequestInterceptor;

    let requestSpy: RequestSpy;
    let responseFaker: ResponseFaker;
    let requestModifier: RequestModifier;
    let responseModifier: ResponseModifier;
    let requestRedirector: RequestRedirector;
    //@ts-ignore
    let requestMatchingSpy: Request;
    let requestMatchingFaker: Request;
    let requestMatchingBlocker: Request;
    let requestMatchingRequestModifier: Request;
    let requestMatchingResponseModifier: Request;
    let requestMatchingRequestRedirector: Request;

    let overrides: Overrides = {
        headers: {key: 'value'}
    };
    let responseFake: RespondOptions = {
        status: 200,
        contentType: 'text/plain',
        body: 'payload'
    };

    before(() => {
        if (!nock.isActive()) {
            nock.activate();
        }
        nock.disableNetConnect();
    });


    after(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        nock.restore();
    });

    before(async () => {
        let matcher: RequestMatcher = (testString: string, pattern: string): boolean => testString.indexOf(pattern) > -1;
        requestInterceptor = new RequestInterceptor(matcher);
        let requestDoubles: Array<Request> = getRequestDoubles();
        let requestHandlers: RequestHandlers = createRequestHandlers(
            responseFake,
            overrides
        );

        ([
            requestMatchingSpy,
            requestMatchingFaker,
            requestMatchingBlocker,
            requestMatchingRequestModifier,
            requestMatchingResponseModifier,
            requestMatchingRequestRedirector
        ] = requestDoubles);

        ({
            requestSpy,
            responseFaker,
            requestModifier,
            responseModifier,
            requestRedirector
        } = requestHandlers);

        addRequestHandlers(requestInterceptor, requestHandlers);
        await simulateUsage(requestInterceptor, requestDoubles);
    });

    describe('class: RequestSpy', async (): Promise<void> => {
        it('should have recognized a match', () => {
            assert.ok(requestSpy.hasMatch(), 'requestSpy did not match url');
        });

        it('should have a matchCount of 3', () => {
            assert.strictEqual(requestSpy.getMatchCount(), 3, 'requestSpy did not increase count on match');

        });

        it('should return passed pattern as Array', () => {
            assert.deepStrictEqual(requestSpy.getPatterns(), ['spy']);

        });

        it('should return passed patterns as Array', () => {
            let requestSpyWithArray: RequestSpy = new RequestSpy(['some/pattern/**/*']);
            assert.deepStrictEqual(requestSpyWithArray.getPatterns(), ['some/pattern/**/*']);
        });

        it('should retrieve expected urls from matched Requests', () => {
            assert.deepStrictEqual(
                getUrlsFromRequestArray(requestSpy.getMatchedRequests()),
                [
                    'spy',
                    'spy',
                    'spy'
                ],
                'requestSpy didn\'t add all urls'
            );
        });

        it('should provide urls as an Array', () => {
            assert.deepStrictEqual(
                requestSpy.getMatchedUrls(),
                [
                    'spy',
                    'spy',
                    'spy'
                ],
                'requestSpy didn\'t add all urls'
            );
        });

        it('should throw an Error on invalid patterns', () => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                // noinspection TsLint
                new RequestSpy(3);
            });
        });
    });

    describe('class: ResponseFaker', async (): Promise<void> => {
        it('should have responded three fakes', async (): Promise<void> => {
            sinon.assert.callCount(<SinonSpy>requestMatchingFaker.respond, 3);
        });

        it('should respond with provided fake', async (): Promise<void> => {
            sinon.assert.calledWithExactly(<SinonSpy>requestMatchingFaker.respond, responseFake);
        });

        it('should return provided fake', async (): Promise<void> => {
            assert.deepStrictEqual(responseFaker.getResponseFake(), responseFake);
        });

        it('should return passed pattern as Array', async (): Promise<void> => {
            assert.deepStrictEqual(responseFaker.getPatterns(), ['faker']);
        });

        it('should return passed patterns as Array', async (): Promise<void> => {
            let responseFakerWithArray: ResponseFaker = new ResponseFaker(['some/pattern/**/*'], responseFake);
            assert.deepStrictEqual(responseFakerWithArray.getPatterns(), ['some/pattern/**/*']);
        });

        it('should throw an Error on invalid patterns', () => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                // noinspection TsLint
                new ResponseFaker(3);
            });
        });
    });

    describe('class: ResponseModifier', async (): Promise<void> => {
        it('should have modified three fakes', async (): Promise<void> => {
            sinon.assert.callCount(<SinonSpy>requestMatchingResponseModifier.respond, 3);
        });

        it('should respond with modified response', async (): Promise<void> => {
            sinon.assert.calledWithExactly(<SinonSpy>requestMatchingResponseModifier.respond, {
                status: 200,
                contentType: 'text/html',
                body: 'original response'
            });
        });

        it('should return passed pattern as Array', async (): Promise<void> => {
            assert.deepStrictEqual(responseModifier.getPatterns(), ['responseModifier']);
        });

        it('should return passed patterns as Array', async (): Promise<void> => {
            let responseModifierWithArray: ResponseModifier = new ResponseModifier(
                new HttpRequestFactory(),
                ['some/pattern/**/*'],
                (originalResponse: Buffer): RespondOptions => {
                    return {
                        status: 200,
                        contentType: 'text/html',
                        body: originalResponse.toString().replace(' body', '')
                    };
                }
            );
            assert.deepStrictEqual(responseModifierWithArray.getPatterns(), ['some/pattern/**/*']);
        });

        it('should throw an Error on invalid patterns', () => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                // noinspection TsLint
                new ResponseModifier(new HttpRequestFactory(), 3);
            });
        });
    });

    describe('class: RequestRedirector', async (): Promise<void> => {
        it('should have redirected three requests', async (): Promise<void> => {
            sinon.assert.callCount(<SinonSpy>requestMatchingRequestRedirector.respond, 3);
        });

        it('should respond with redirected fake', async (): Promise<void> => {
            sinon.assert.calledWithExactly(<SinonSpy>requestMatchingRequestRedirector.respond, {
                status: 200,
                contentType: 'text/html',
                body: 'redirected response body'
            });
        });

        it('should return passed pattern as Array', async (): Promise<void> => {
            assert.deepStrictEqual(requestRedirector.getPatterns(), ['requestRedirector']);
        });

        it('should return passed patterns as Array', async (): Promise<void> => {
            let requestRedirectorWithArray: RequestRedirector = new RequestRedirector(
                new HttpRequestFactory(),
                ['some/pattern/**/*'],
                sinon.stub().returns({})
            );

            assert.deepStrictEqual(requestRedirectorWithArray.getPatterns(), ['some/pattern/**/*']);
        });

        it('should throw an Error on invalid patterns', () => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                // noinspection TsLint
                new RequestRedirector(new HttpRequestFactory(), 3);
            });
        });
    });

    describe('class: RequestBlocker', () => {
        it('should block request if urlsToBlock is added and matched', async (): Promise<void> => {
            sinon.assert.callCount(<SinonSpy>requestMatchingBlocker.abort, 3);
        });
    });

    describe('class: RequestModifier', () => {
        it('should call continue with provided override options', () => {
            sinon.assert.calledWithExactly(<SinonSpy>requestMatchingRequestModifier.continue, overrides);
        });

        it('should return passed pattern as Array', async (): Promise<void> => {
            assert.deepStrictEqual(requestModifier.getPatterns(), ['modifier']);
        });

        it('should return passed patterns as Array', async (): Promise<void> => {
            let requestModifierWithArray: RequestModifier = new RequestModifier(['some/pattern/**/*'], overrides);
            assert.deepStrictEqual(requestModifierWithArray.getPatterns(), ['some/pattern/**/*']);
        });

        it('should return provided override', () => {
            assert.deepStrictEqual(requestModifier.getOverride(), overrides);
        });

        it('should throw an Error on invalid patterns', () => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                // noinspection TsLint
                new RequestModifier(3);
            });
        });
    });
});
