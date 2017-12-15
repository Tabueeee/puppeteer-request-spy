import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {Logger} from '../../src/common/Logger';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {TestDouble} from '../common/TestDouble';
import {getErrorRequestDouble, getRequestDouble, getRequestSpyDouble} from '../common/testDoubleFactories';

describe('class: RequestInterceptor', function (): void {
    describe('happy path', function (): void {
        it('spies gets called', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble();
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.addSpy(<RequestSpy> requestSpy);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.addMatchedUrl.callCount === 1 && requestSpy.getPatterns.called === true, '');
        });

        it('spies does not get called', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble();
            requestInterceptor.addSpy(<RequestSpy> requestSpy);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.addMatchedUrl.callCount === 0 && requestSpy.getPatterns.called === true, '');
        });

        it('clears list of spies', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble();
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.clearSpies();

            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.addMatchedUrl.callCount === 0 && requestSpy.getPatterns.called === false, '');
        });

        it('continue does not get called if abort was called', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.block('any-url');

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.abort.callCount === 1, '');
        });

        it('abort does not get called if continue was called', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.block('any-url');

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 1 && request.abort.callCount === 0, '');
        });

        it('logs when debug is set and request is not blocked', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let loggerDouble: TestDouble<Logger> = {log: sinon.spy()};
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher, <Logger> loggerDouble);
            let request: TestDouble<Request> = getRequestDouble();
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble();
            requestInterceptor.addSpy(<RequestSpy> requestSpy);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(loggerDouble.log.callCount === 1, '');
        });

        it('logs when debug is set and request is blocked', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let loggerDouble: TestDouble<Logger> = {log: sinon.spy()};
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher, <Logger> loggerDouble);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.block(['any-url']);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(loggerDouble.log.callCount === 1, `${loggerDouble.log.callCount} !== 1`);
        });

        it('does not block requests if UrlsToBlock was cleared', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.block('any-url');

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 1 && request.abort.callCount === 0, '');
        });

        it('does block requests if UrlsToBlock were set manually', async function (): Promise<void> {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.setUrlsToBlock(['any-url']);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.abort.callCount === 1, '');
        });
    });

    describe('sad path', function (): void {
        it('proceeds without error when requestInterception is disabled on abort', async function (): Promise<void> {
            let error: Error | undefined;
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getErrorRequestDouble();
            requestInterceptor.setUrlsToBlock(['any-url']);

            try {
                await requestInterceptor.intercept(<Request> request);
            } catch (caughtError) {
                error = caughtError;
            }

            assert.ok(typeof error === 'undefined');
        });

        it('proceeds without error when requestInterception is disabled on continue', async function (): Promise<void> {
            let error: Error | undefined;
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getErrorRequestDouble();
            requestInterceptor.setUrlsToBlock(['any-url']);

            try {
                await requestInterceptor.intercept(<Request> request);
            } catch (caughtError) {
                error = caughtError;
            }

            assert.ok(typeof error === 'undefined');
        });
    });
});
