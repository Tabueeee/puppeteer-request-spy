import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {TestDouble} from '../common/TestDouble';
import {getErrorRequestDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('puppeteer-request-spy: unit', function (): void {
    describe('happy path', function (): void {
        let requestInterceptor: RequestInterceptor;

        before(() => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            requestInterceptor = new RequestInterceptor(matcher, {log: (): void => undefined});
        });

        beforeEach(() => {
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.clearSpies();
        });

        it('increases count for matched urls', async function (): Promise<void> {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(requestSpy.getMatchCount(), 3, 'requestSpy did not increase count on match');
        });

        it('adds matched urls to array', async function (): Promise<void> {
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

        it('does have hasMatch on matched urls', async function (): Promise<void> {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.hasMatch(), 'requestSpy did not match url');
        });

        it('blocks request if urlsToBlock is added and matched', async function (): Promise<void> {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.block(['']);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 3, 'requestIntercept blocked to few requests');
        });
    });

    describe('sad path', function (): void {
        let requestInterceptor: RequestInterceptor;

        before(() => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            requestInterceptor = new RequestInterceptor(matcher);
        });

        beforeEach(() => {
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.clearSpies();
        });

        it('does not increase count for mismatched urls', async function (): Promise<void> {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(requestSpy.getMatchCount(), 0, 'requestSpy increased match count');
        });

        it('does not add mismatched urls to array', async function (): Promise<void> {
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

        it('does not hasMatch on mismatched urls', async function (): Promise<void> {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.deepEqual(requestSpy.hasMatch(), false, 'requestSpy has a match');
        });

        it('does not block request if urlsToBlock is set and not matched', async function (): Promise<void> {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.setUrlsToBlock(['']);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);
            await requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 0, 'abort was called');
        });
    });
    describe('sad path', function (): void {
        it('spy rejects invalid pattern', function (): void {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestSpy(3).hasMatch();
            });
        });

        it('no error if requestInterception is not set and request is aborted', async function (): Promise<void> {
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

        it('no error if requestInterception is not set and request is continued', async function (): Promise<void> {
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
