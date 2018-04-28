import * as assert from 'assert';
import * as minimatch from 'minimatch';
import {Browser, Page} from 'puppeteer';
import {RequestInterceptor} from '../../src/RequestInterceptor';
import {RequestSpy} from '../../src/RequestSpy';
import {browserLauncher} from '../common/Browser';
import {serverSettings} from '../common/ServerSettings';
import {getLoggerFake} from '../common/testDoubleFactories';

const staticServerIp: string = `http://${serverSettings.host}:${serverSettings.port}`;

describe('puppeteer-request-spy: integration', function (): void {
    // noinspection TsLint
    this.timeout(30000);
    // noinspection TsLint
    this.slow(20000);

    let browser: Browser;
    let page: Page;
    let requestInterceptor: RequestInterceptor;

    before(async function (): Promise<void> {
        browser = await browserLauncher.getBrowser();
        requestInterceptor = new RequestInterceptor(minimatch);
    });

    beforeEach(async () => {
        requestInterceptor.clearSpies();
        requestInterceptor.clearUrlsToBlock();
        page = await browser.newPage();
        page.setViewport(
            {
                width: 920,
                height: 1000
            }
        );
    });

    afterEach(async () => {
        await page.close();
    });

    describe('happy path', function (): void {
        it('requestInterceptor blocks all matched requests', async function (): Promise<void> {
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

            assert.deepEqual(logs, expectedLogs, 'RequestInterceptor does not log correct blocked / loaded requests');
        });

        it('spy tracks all matched requests', async function (): Promise<void> {
            let requestSpy: RequestSpy = new RequestSpy([`!${staticServerIp}/favicon.ico`]);
            let secondRequestSpy: RequestSpy = new RequestSpy(`**/*`);
            let notMatchingRequestSpy: RequestSpy = new RequestSpy(`**/*.min.js`);

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
            assert.equal(requestSpy.getMatchCount(), 3, 'spy reports wrong matchCount');
            assert.equal(notMatchingRequestSpy.getMatchCount(), 0, 'spy reports wrong matchCount');
            assert.deepEqual(
                requestSpy.getMatchedUrls(),
                [
                    `${staticServerIp}/index.html`,
                    `${staticServerIp}/style.css`,
                    `${staticServerIp}/script.js`
                ],
                'spy does not return matched urls'
            );
        });
    });

    describe('sad path', function (): void {
        it('spy rejects other input', function (): void {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                let requestSpy: RequestSpy = new RequestSpy(3);
            });
        });

        it('requestInterceptor blocks all matched requests', async function (): Promise<void> {
            let logs: Array<string> = [];
            let expectedLogs: Array<string> = [
                'AssertionError [ERR_ASSERTION]: Request Interception is not enabled!',
                'AssertionError [ERR_ASSERTION]: Request Interception is not enabled!',
                'AssertionError [ERR_ASSERTION]: Request Interception is not enabled!'
            ];

            let requestInterceptorWithLoggerFake: RequestInterceptor = new RequestInterceptor(minimatch, getLoggerFake(logs));
            requestInterceptorWithLoggerFake.setUrlsToBlock([`**/*.css`]);
            requestInterceptorWithLoggerFake.block([`${staticServerIp}/*.js`, '**/*.ico']);

            await page.setRequestInterception(false);
            page.on('request', requestInterceptorWithLoggerFake.intercept.bind(requestInterceptorWithLoggerFake));

            await page.goto(`${staticServerIp}/index.html`, {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.deepEqual(logs, expectedLogs, 'RequestInterceptor does not log correct blocked / loaded requests');
        });
    });
});
