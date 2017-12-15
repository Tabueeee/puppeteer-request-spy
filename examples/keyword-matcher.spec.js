const puppeteer          = require('puppeteer');
const RequestInterceptor = require('puppeteer-request-spy').RequestInterceptor;
const RequestSpy         = require('puppeteer-request-spy').RequestSpy;
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
    this.slow(20000);

    let requestInterceptor;
    let imagesSpy;

    before(() => {
        imagesSpy           = new RequestSpy('images');
        requestInterceptor = new RequestInterceptor(
            (testee, pattern) => testee.indexOf(pattern) > -1,
            console
        );

        requestInterceptor.addSpy(imagesSpy);
    });

    describe('example-block', function () {
        it('example-test', async function () {
            let page = await browser.newPage();

            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));

            await page.goto('https://www.example.org/', {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            assert.ok(imagesSpy.hasMatch() && imagesSpy.getMatchCount() > 0);
        });
    });
});
