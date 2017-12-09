const puppeteer          = require('puppeteer');
const RequestInterceptor = require('..').RequestInterceptor;
const RequestSpy         = require('..').RequestSpy;
const assert             = require('assert');

let browser;

before(async () => {
    browser = await puppeteer.launch({
        headless: true
    });
});

after(async () => {
    await browser.close();
});

describe('example-block', function () {
    this.timeout(30000);
    this.slow(10000);
    let requestInterceptor;
    let secondaryRequestSpy;

    before(() => {
        function matcher(testee, pattern) {
            return testee !== pattern;
        }

        requestInterceptor  = new RequestInterceptor(matcher, console);
        secondaryRequestSpy = new RequestSpy('https://www.example.org/');
        requestInterceptor.addSpy(secondaryRequestSpy);
        requestInterceptor.block('https://www.example.org/');
    });

    describe('example-block', function () {

        it('example-test', async function () {
            let page = await browser.newPage();
            page.setRequestInterception(true);
            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));

            await page.goto('https://www.example.org', {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.ok(secondaryRequestSpy.hasMatch() && secondaryRequestSpy.getMatchCount() > 0);
        });
    });
});
