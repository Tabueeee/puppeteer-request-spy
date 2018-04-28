import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {TestDouble} from '../common/TestDouble';
import {getErrorRequestDouble, getLowVersionRequestDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('puppeteer-request-spy: unit', (): void => {
    describe('happy path', (): void => {
        let requestInterceptor: RequestInterceptor;

        before(() => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            requestInterceptor = new RequestInterceptor(matcher, {log: (): void => undefined});
        });

        beforeEach(() => {
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.clearSpies();
            requestInterceptor.clearFakers();
        });

        it('increases count for matched urls', async (): Promise<void> => {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(requestSpy.getMatchCount(), 3, 'requestSpy did not increase count on match');
        });

        it('adds matched urls to matchedUrls array', async (): Promise<void> => {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.deepEqual(
                requestSpy.getMatchedUrls(),
                [
                    'any-url',
                    'any-url',
                    'any-url'
                ],
                'requestSpy didn\'t add all urls'
            );
        });

        it('sets hasMatch flag on RequestSpy for matched urls', async (): Promise<void> => {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.hasMatch(), 'requestSpy did not match url');
        });

        it('blocks request if urlsToBlock is added and matched', async (): Promise<void> => {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.block(['']);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 3, 'requestIntercept blocked to few requests');
        });

        it('fakes request if RequestFaker is added and matched', async (): Promise<void> => {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addFaker(new ResponseFaker('some/pattern/**/*', {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            }));
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.respond.callCount, 3, 'requestIntercept faked to few requests');
        });

        it('supports old Request version', async (): Promise<void> => {
            let request: TestDouble<Request> = getLowVersionRequestDouble();

            requestInterceptor.block(['']);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 3, 'requestIntercept blocked to few requests');
        });

    });

    describe('sad path', (): void => {
        let requestInterceptor: RequestInterceptor;

        before(() => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            requestInterceptor = new RequestInterceptor(matcher);
        });

        beforeEach(() => {
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.clearSpies();
            requestInterceptor.clearFakers();
        });

        it('does not increase count for mismatched urls', async (): Promise<void> => {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(requestSpy.getMatchCount(), 0, 'requestSpy increased match count');
        });

        it('does not add mismatched urls to array', async (): Promise<void> => {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy(['some/pattern/**/*', 'some/second/**/*']);
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.deepEqual(
                requestSpy.getMatchedUrls(),
                [],
                'request spy added mismatched urls'
            );
        });

        it('does not hasMatch on mismatched urls', async (): Promise<void> => {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.deepEqual(requestSpy.hasMatch(), false, 'requestSpy has a match');
        });

        it('does not block request if urlsToBlock is set and not matched', async (): Promise<void> => {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.setUrlsToBlock(['']);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 0, 'abort was called');
        });

        it('does not fake request if RequestFaker is added and not matched', async (): Promise<void> => {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addFaker(new ResponseFaker('some/pattern/**/*', {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            }));
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 0, 'requestIntercept faked to few requests');
        });
    });

    describe('sad path', (): void => {
        it('spy rejects invalid pattern', (): void => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestSpy(3).hasMatch();
            });
        });

        it('no error if requestInterception is not set and request is aborted', async (): Promise<void> => {
            let error: Error | undefined;
            let request: TestDouble<Request> = getErrorRequestDouble();
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher, {log: (): void => undefined});

            requestInterceptor.setUrlsToBlock(['any-url']);
            try {
                await requestInterceptor.intercept(<Request> request);

            } catch (caughtError) {
                error = caughtError;
            }

            assert.ok(typeof error === 'undefined', 'abort was called');
        });

        it('no error if requestInterception is not set and request is continued', async (): Promise<void> => {
            let error: Error | undefined;
            let request: TestDouble<Request> = getErrorRequestDouble();
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher, {log: (): void => undefined});

            requestInterceptor.setUrlsToBlock(['any-url']);
            try {
                await requestInterceptor.intercept(<Request> request);

            } catch (caughtError) {
                error = caughtError;
            }

            assert.ok(typeof error === 'undefined', 'abort was called');
        });
    });
});
