import * as assert from 'assert';
import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {TestDouble} from '../common/TestDouble';
import {getRequestDouble} from '../common/testDoubleFactories';

describe(
    'puppeteer-request-spy: regression-unit: #4 Locks after starting to intercept requests when there are no urls to block added ',
    (): void => {
        describe('happy-path: ensure continue is called, when requestInterceptor does not match', () => {
            let requestInterceptor: RequestInterceptor;

            before(() => {
                let matcher: (testString: string, pattern: string) => boolean = sinon.stub().returns(false);
                requestInterceptor = new RequestInterceptor(matcher, {log: (): void => undefined});
            });

            beforeEach(() => {
                requestInterceptor.clearUrlsToBlock();
                requestInterceptor.clearSpies();
                requestInterceptor.clearFakers();
            });

            it('RequestSpy only', async (): Promise<void> => {
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === true
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('ResponseFaker only', async (): Promise<void> => {
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.addFaker(<ResponseFaker> responseFaker);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === true
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('block only', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === true
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('block and Faker', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});

                requestInterceptor.addFaker(<ResponseFaker> responseFaker);
                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok((
                              <SinonSpy> request.continue).called === true
                          && (<SinonSpy> request.respond).called === false
                          && (<SinonSpy> request.abort).called === false
                );
            });

            it('Spy and Faker', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                requestInterceptor.addFaker(<ResponseFaker> responseFaker);

                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === true
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('Spy and block', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);

                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok((
                              <SinonSpy> request.continue).called === true
                          && (<SinonSpy> request.respond).called === false
                          && (<SinonSpy> request.abort).called === false
                );
            });

            it('Spy, block and Faker', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});

                requestInterceptor.addFaker(<ResponseFaker> responseFaker);
                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);

                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok((
                              <SinonSpy> request.continue).called === true
                          && (<SinonSpy> request.respond).called === false
                          && (<SinonSpy> request.abort).called === false
                );
            });
        });

        describe('sad-path: ensure only one request action is called, when requestInterceptor does match', () => {
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

            it('RequestSpy only', async (): Promise<void> => {
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === true
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('RequestSpy only', async (): Promise<void> => {
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === true
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('ResponseFaker only', async (): Promise<void> => {
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.addFaker(<ResponseFaker> responseFaker);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === false
                    && (<SinonSpy> request.respond).called === true
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('block only', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();

                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === false
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === true
                );
            });

            it('block and Faker', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});

                requestInterceptor.addFaker(<ResponseFaker> responseFaker);
                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === false
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === true
                );
            });

            it('Spy and Faker', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                requestInterceptor.addFaker(<ResponseFaker> responseFaker);

                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === false
                    && (<SinonSpy> request.respond).called === true
                    && (<SinonSpy> request.abort).called === false
                );
            });

            it('Spy and block', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');

                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);

                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === false
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === true
                );
            });

            it('Spy, block and Faker', async (): Promise<void> => {
                let request: TestDouble<Request> = getRequestDouble();
                let requestSpy: TestDouble<RequestSpy> = new RequestSpy('some/pattern/**/*');
                let responseFaker: TestDouble<ResponseFaker> = new ResponseFaker('some/pattern/**/*', {});

                requestInterceptor.addFaker(<ResponseFaker> responseFaker);
                requestInterceptor.addSpy(<RequestSpy> requestSpy);
                requestInterceptor.block(['not-matching-pattern1', 'not-matching-pattern2']);

                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);
                await requestInterceptor.intercept(<Request> request);

                assert.ok(
                    (<SinonSpy> request.continue).called === false
                    && (<SinonSpy> request.respond).called === false
                    && (<SinonSpy> request.abort).called === true
                );
            });
        });
    }
);
