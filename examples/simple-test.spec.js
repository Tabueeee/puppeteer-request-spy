const puppeteer          = require('puppeteer');
const RequestInterceptor = require('puppeteer-request-spy').RequestInterceptor;
const RequestSpy         = require('puppeteer-request-spy').RequestSpy;
const minimatch          = require('minimatch');
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
    let pngSpy;

    before(() => {
        requestInterceptor = new RequestInterceptor(minimatch, console);
        pngSpy             = new RequestSpy('**/*.png');

        requestInterceptor.addSpy(pngSpy);
        requestInterceptor.block('!https://www.example.org/');
    });

    describe('example-block', function () {
        it('example-test', async function () {
            let page = await browser.newPage();

            page.setRequestInterception(true);
            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));

            await page.goto('https://www.example.org/', {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.ok(pngSpy.hasMatch() && pngSpy.getMatchCount() > 0);
        });
    });
});
