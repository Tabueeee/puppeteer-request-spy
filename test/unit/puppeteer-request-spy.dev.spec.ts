import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {TestDouble} from '../common/TestDouble';
import {getRequestDouble} from '../common/testDoubleFactories';

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

        it('increases count for matched urls', function (): void {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

            assert.equal(requestSpy.getMatchCount(), 3, 'requestSpy did not increase count on match');
        });

        it('adds matched urls to array', function (): void {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

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

        it('does have hasMatch on matched urls', function (): void {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.hasMatch(), 'requestSpy did not match url');
        });

        it('blocks request if urlsToBlock is added and matched', function (): void {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.block(['']);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

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

        it('does not increase count for mismatched urls', function (): void {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

            assert.equal(requestSpy.getMatchCount(), 0, 'requestSpy increased match count');
        });

        it('does not add mismatched urls to array', function (): void {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy(['some/pattern/**/*', 'some/second/**/*']);
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

            assert.deepEqual(
                requestSpy.getMatchedUrls(),
                [],
                'request spy added mismatched urls'
            );
        });

        it('does not hasMatch on mismatched urls', function (): void {
            let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

            assert.deepEqual(requestSpy.hasMatch(), false, 'requestSpy has a match');
        });

        it('does not block request if urlsToBlock is set and not matched', function (): void {
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.setUrlsToBlock(['']);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);
            requestInterceptor.intercept(<Request> request);

            assert.equal(request.abort.callCount, 0, 'abort was called');
        });

        it('spy rejects invalid pattern', function (): void {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestSpy(3).hasMatch();
            });
        });
    });
});
