import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {ILogger} from '../../src/common/Logger';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {TestDouble} from '../common/TestDouble';
import {getErrorRequestDouble, getRequestDouble, getRequestFakerDouble, getRequestSpyDouble} from '../common/testDoubleFactories';
import {IRequestBlocker} from '../../src/interface/IRequestBlocker';
import {CustomRequestBlocker} from '../common/CustomRequestBlocker';

describe('class: RequestInterceptor', (): void => {
    describe('happy path', (): void => {
        it('calls RequestSpy when matched', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let matchesRequest: boolean = true;
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble(matchesRequest);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.addSpy(<RequestSpy> requestSpy);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.addMatch.callCount === 1 && requestSpy.isMatchingRequest.called === true);
        });

        it('does not call RequestSpy when not matched', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            let matchesRequest: boolean = false;
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble(matchesRequest);
            requestInterceptor.addSpy(<RequestSpy> requestSpy);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.addMatch.callCount === 0 && requestSpy.isMatchingRequest.called === true);
        });

        it('calls ResponseFaker to confirm match', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let matchesRequest: boolean = true;
            let responseFakerTestDouble: TestDouble<ResponseFaker> = getRequestFakerDouble(matchesRequest);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.addFaker(<ResponseFaker> responseFakerTestDouble);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(responseFakerTestDouble.getResponseFake.callCount === 1 && responseFakerTestDouble.isMatchingRequest.called === true);
        });

        it('does not call ResponseFaker when not matched', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let matchesRequest: boolean = false;
            let responseFakerTestDouble: TestDouble<ResponseFaker> = getRequestFakerDouble(matchesRequest);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.addFaker(<ResponseFaker> responseFakerTestDouble);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(responseFakerTestDouble.getResponseFake.callCount === 0 && responseFakerTestDouble.isMatchingRequest.called === true);
        });

        it('clears list of RequestSpy', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let matchesRequest: boolean = false;
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble(matchesRequest);
            let request: TestDouble<Request> = getRequestDouble();

            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.addSpy(<RequestSpy> requestSpy);
            requestInterceptor.clearSpies();

            await requestInterceptor.intercept(<Request> request);

            assert.ok(requestSpy.addMatch.callCount === 0 && requestSpy.isMatchingRequest.called === false);
        });

        it('clears list of RequestFaker', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            let matchesRequest: boolean = true;
            let responseFakerTestDouble: TestDouble<ResponseFaker> = getRequestFakerDouble(matchesRequest);

            requestInterceptor.addFaker(<ResponseFaker> responseFakerTestDouble);
            requestInterceptor.addFaker(<ResponseFaker> responseFakerTestDouble);
            requestInterceptor.addFaker(<ResponseFaker> responseFakerTestDouble);

            requestInterceptor.clearFakers();

            await requestInterceptor.intercept(<Request> request);

            assert.ok(responseFakerTestDouble.getResponseFake.callCount === 0 && responseFakerTestDouble.isMatchingRequest.called === false);
        });

        it('does not call continue nor respond if abort was called', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.block('any-url');

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.respond.callCount === 0 && request.abort.callCount === 1);
        });

        it('does not call abort nor respond if continue was called', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.block('any-url');

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 1 && request.abort.callCount === 0 && request.respond.callCount === 0);
        });

        it('does not call abort nor continue if respond was called', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            let matchesRequest: boolean = true;
            let responseFakerTestDouble: TestDouble<ResponseFaker> = getRequestFakerDouble(matchesRequest);
            requestInterceptor.addFaker(<ResponseFaker> responseFakerTestDouble);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.abort.callCount === 0 && request.respond.callCount === 1);
        });

        it('calls logger when debug is set and request is not blocked', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let loggerDouble: TestDouble<ILogger> = {log: sinon.spy()};
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher, <ILogger> loggerDouble);
            let request: TestDouble<Request> = getRequestDouble();
            let matchesRequest: boolean = false;
            let requestSpy: TestDouble<RequestSpy> = getRequestSpyDouble(matchesRequest);
            requestInterceptor.addSpy(<RequestSpy> requestSpy);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(loggerDouble.log.callCount === 1);
        });

        it('calls logger when debug is set and request is blocked', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let loggerDouble: TestDouble<ILogger> = {log: sinon.spy()};
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher, <ILogger> loggerDouble);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.block(['any-url']);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(loggerDouble.log.callCount === 1);
        });

        it('RequestInterceptor clears list of urls to block', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.block('any-url');

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 1 && request.abort.callCount === 0);
        });

        it('blocks requests if UrlsToBlock was set manually', async (): Promise<void> => {
            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            let request: TestDouble<Request> = getRequestDouble();
            requestInterceptor.clearUrlsToBlock();
            requestInterceptor.setUrlsToBlock(['any-url']);

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.respond.callCount === 0 && request.abort.callCount === 1);
        });

        it('accepts new RequestBlocker', async (): Promise<void> => {
            let requestBlocker: IRequestBlocker = {
                shouldBlockRequest: (): boolean => true,
                clearUrlsToBlock: (): void => undefined,
                addUrlsToBlock: (): void => undefined
            };

            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            requestInterceptor.setRequestBlocker(requestBlocker);
            let request: TestDouble<Request> = getRequestDouble();

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.respond.callCount === 0 && request.abort.callCount === 1);
        });

        it('accepts new RequestBlocker', async (): Promise<void> => {
            let requestBlocker: IRequestBlocker = new CustomRequestBlocker();

            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);
            requestInterceptor.setRequestBlocker(requestBlocker);
            let request: TestDouble<Request> = getRequestDouble();

            await requestInterceptor.intercept(<Request> request);

            assert.ok(request.continue.callCount === 0 && request.respond.callCount === 0 && request.abort.callCount === 1);
        });
    });

    describe('sad path', (): void => {
        it('proceeds without error when requestInterception is disabled on abort', async (): Promise<void> => {
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

        it('proceeds without error when requestInterception is disabled', async (): Promise<void> => {
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

        it('rejects invalid RequestBlocker', async (): Promise<void> => {
            let requestBlocker: any = {
                clearUrlsToBlock: (): void => undefined,
                addUrlsToBlock: (): void => undefined
            };

            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);

            assert.throws(() => {
                requestInterceptor.setRequestBlocker(requestBlocker);
            });
        });

        it('rejects invalid RequestSpy', async (): Promise<void> => {
            let requestSpy: any = {
            };

            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);

            assert.throws(() => {
                requestInterceptor.addSpy(requestSpy);
            });
        });

        it('rejects invalid ResponseFaker', async (): Promise<void> => {
            let responseFaker: any = {
            };

            let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(true);
            let requestInterceptor: RequestInterceptor = new RequestInterceptor(matcher);

            assert.throws(() => {
                requestInterceptor.addFaker(responseFaker);
            });
        });
    });
});
