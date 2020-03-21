import * as assert from 'assert';
import * as minimatch from 'minimatch';
import {Browser, Page, Request, RespondOptions} from 'puppeteer';
import {HttpRequestFactory, IResponseFaker, RequestModifier, RequestRedirector, ResponseModifier} from '../../src';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {browserLauncher} from '../common/Browser';
import {CustomFaker} from '../common/CustomFaker';
import {getUrlsFromRequestArray} from '../common/helpers';
import {serverDouble} from '../common/ServerDouble';
import {serverSettings} from '../common/ServerSettings';
import {getLoggerFake} from '../common/testDoubleFactories';

describe('puppeteer-request-spy: integration', function (): void {
    // noinspection TsLint
    this.timeout(60000);
    // noinspection TsLint
    this.slow(20000);

    let browser: Browser;
    let page: Page;
    let requestInterceptor: RequestInterceptor;
    let staticServerIp: string;

    before(async (): Promise<void> => {
        staticServerIp = `http://${serverSettings.host}:${serverSettings.port}`;
        let serverStarted: Promise<{}> = serverDouble.start();
        let browserPromise: Promise<Browser> = browserLauncher.getBrowser();

        // @ts-ignore
        let [serverLocal, browserLocal] = await Promise.all([serverStarted, browserPromise]);
        browser = browserLocal;

        requestInterceptor = new RequestInterceptor(minimatch);
    });

    after(async () => {
        await browser.close();
        serverDouble.stop();
    });

    beforeEach(async () => {
        requestInterceptor.clearSpies();
        requestInterceptor.clearUrlsToBlock();
        requestInterceptor.clearFakers();
        page = await browser.newPage();
        await page.setViewport(
            {
                width: 920,
                height: 1000
            }
        );
    });

    afterEach(async () => {
        await page.close();
    });

    describe('happy path', (): void => {
        it('requestInterceptor blocks all matched requests', async (): Promise<void> => {
            let logs: Array<string> = [];
            let expectedLogs: Array<string> = [
                `loaded: ${staticServerIp}/index.html`,
                `aborted: ${staticServerIp}/style.css`,
                `aborted: ${staticServerIp}/script.js`
            ];

            let requestInterceptorWithLoggerFake: RequestInterceptor = new RequestInterceptor(minimatch, getLoggerFake(logs));
            requestInterceptorWithLoggerFake.setUrlsToBlock([`**/*.css`]);
            requestInterceptorWithLoggerFake.block([`${staticServerIp}/*.js`, '**/*.ico']);

            await page.setRequestInterception(true);
            page.on('request', requestInterceptorWithLoggerFake.intercept.bind(requestInterceptorWithLoggerFake));

            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.deepStrictEqual(logs, expectedLogs, 'RequestInterceptor does not log correct blocked / loaded requests');
        });

        it('spy tracks all matched requests', async (): Promise<void> => {
            let requestSpy: RequestSpy = new RequestSpy([`!${staticServerIp}/favicon.ico`]);
            let secondRequestSpy: RequestSpy = new RequestSpy('**/*');
            let notMatchingRequestSpy: RequestSpy = new RequestSpy('**/*.min.js');

            requestInterceptor.addSpy(requestSpy);
            requestInterceptor.addSpy(secondRequestSpy);
            requestInterceptor.addSpy(notMatchingRequestSpy);

            await page.setRequestInterception(false);
            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.ok(secondRequestSpy.hasMatch(), 'spy does not report a match');
            assert.strictEqual(requestSpy.getMatchCount(), 4, 'spy reports wrong matchCount');
            assert.strictEqual(notMatchingRequestSpy.getMatchCount(), 0, 'spy reports wrong matchCount');
            let expected: Array<string> = [
                `${staticServerIp}/index.html`,
                `${staticServerIp}/style.css`,
                `${staticServerIp}/script.js`,
                `${staticServerIp}/remote.html`
            ];

            assert.deepStrictEqual(
                getUrlsFromRequestArray((<Array<Request>>requestSpy.getMatchedRequests())),
                expected,
                'requestSpy didn\'t add all urls'
            );

            assert.deepStrictEqual(
                requestSpy.getMatchedUrls(),
                expected,
                'spy does not return matched urls'
            );
        });

        it('ResponseModifier modifies responses of matched requests', async (): Promise<void> => {
            let modifier: ResponseModifier = new ResponseModifier(
                new HttpRequestFactory(),
                '**/remote.html',
                (response: Buffer): RespondOptions => {
                    let body: string = response.toString()
                                               .replace(
                                                   'some stuff',
                                                   'some modified stuff'
                                               );

                    return {
                        body
                    };
                }
            );
            requestInterceptor.addFaker(modifier);
            await page.setRequestInterception(true);
            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            let innerHtml: string = await page.evaluate(() => {
                // @ts-ignore: browser-script
                return document.getElementById('xhr').innerHTML;
            });

            assert.strictEqual(innerHtml, '<p>some modified stuff</p>\n');
        });

        it('RequestRedirector redirects matched requests', async (): Promise<void> => {
            let redirector: RequestRedirector = new RequestRedirector(new HttpRequestFactory(), '**/remote.html', () => {
                return {url: `${staticServerIp}/redirected.html`, options: {}};
            });

            requestInterceptor.addFaker(redirector);
            await page.setRequestInterception(true);
            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            let innerHtml: string = await page.evaluate(() => {
                // @ts-ignore: browser-script
                return document.getElementById('xhr').innerHTML;
            });

            assert.strictEqual(innerHtml, '<p>some redirected stuff</p>\n');
        });

        it('RequestModifier modifies matched requests', async (): Promise<void> => {
            let requestModifier: RequestModifier = new RequestModifier(
                '**/remote.html',
                {
                    url: `${staticServerIp}/redirected.html`
                }
            );

            requestInterceptor.addRequestModifier(requestModifier);
            await page.setRequestInterception(true);
            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            let innerHtml: string = await page.evaluate(() => {
                // @ts-ignore: browser-script
                return document.getElementById('xhr').innerHTML;
            });

            assert.strictEqual(innerHtml, '<p>some redirected stuff</p>\n');
        });

        it('faker sends testfake for matched requests', async (): Promise<void> => {
            let responseFaker: ResponseFaker = new ResponseFaker('**/remote.html', {
                status: 200,
                contentType: 'text/plain',
                body: 'Not Found!'
            });

            let requestInterceptorWithLoggerFake: RequestInterceptor = new RequestInterceptor(minimatch);
            requestInterceptorWithLoggerFake.addFaker(responseFaker);
            requestInterceptorWithLoggerFake.setUrlsToBlock([`**/*.css`]);
            requestInterceptorWithLoggerFake.block(['**/*.ico']);

            await page.setRequestInterception(true);
            page.on('request', requestInterceptorWithLoggerFake.intercept.bind(requestInterceptorWithLoggerFake));

            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            let innerHtml: string = await page.evaluate(() => {
                // @ts-ignore: browser-script
                return document.getElementById('xhr').innerHTML;
            });

            assert.strictEqual(innerHtml, 'Not Found!');
        });

        it('faker with dynamic response sends testfake for matched requests', async (): Promise<void> => {
            let responseFaker: IResponseFaker = new CustomFaker();

            let requestInterceptorWithLoggerFake: RequestInterceptor = new RequestInterceptor(minimatch);
            requestInterceptorWithLoggerFake.addFaker(responseFaker);

            await page.setRequestInterception(true);
            page.on('request', requestInterceptorWithLoggerFake.intercept.bind(requestInterceptorWithLoggerFake));

            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            let innerHtml: string = await page.evaluate(() => {
                // @ts-ignore: browser-script
                return document.getElementById('xhr').innerHTML;
            });

            assert.strictEqual(innerHtml, 'Just a mock!');
        });
    });

    describe('sad path', (): void => {
        it('RequestSpy rejects other input', (): void => {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestSpy(3);
            });
        });

        it('RequestInterceptor blocking request without requestInterception flag', async (): Promise<void> => {
            let logs: Array<string> = [];

            let requestInterceptorWithLoggerFake: RequestInterceptor = new RequestInterceptor(minimatch, getLoggerFake(logs));
            requestInterceptorWithLoggerFake.setUrlsToBlock([`**/*.css`]);
            requestInterceptorWithLoggerFake.block([`${staticServerIp}/*.js`, '**/*.ico']);

            await page.setRequestInterception(false);
            page.on('request', requestInterceptorWithLoggerFake.intercept.bind(requestInterceptorWithLoggerFake));

            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.ok(logs.indexOf('Error: Request Interception is not enabled!') > -1);
        });

        it('RequestFaker faking request without requestInterception flag', async (): Promise<void> => {
            let logs: Array<string> = [];

            let responseFaker: ResponseFaker = new ResponseFaker('*remote*', {
                status: 200,
                contentType: 'text/plain',
                body: 'Not Found!'
            });

            let requestInterceptorWithLoggerFake: RequestInterceptor = new RequestInterceptor(minimatch, getLoggerFake(logs));
            requestInterceptorWithLoggerFake.addFaker(responseFaker);

            await page.setRequestInterception(false);
            page.on('request', requestInterceptorWithLoggerFake.intercept.bind(requestInterceptorWithLoggerFake));

            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.ok(logs.indexOf('Error: Request Interception is not enabled!') > -1);
        });
    });
});
