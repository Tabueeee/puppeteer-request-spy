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
        imagesSpy           = new RequestSpy('pictures');
        requestInterceptor = new RequestInterceptor(
            (testee, pattern) => testee.indexOf(pattern) > -1,
            console
        );

        requestInterceptor.addSpy(imagesSpy);
    });

    describe('example-block', function () {
        it('example-test', async function () {
            let page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', requestInterceptor.intercept.bind(requestInterceptor));

            // waiting for networkidle0 ensures that all request have been loaded before the page.goto promise resolves
            await page.goto('https://www.example.org/', {
                waitUntil: 'networkidle0',
                timeout: 3000000
            });

            // verify spy found matches
            assert.ok(imagesSpy.hasMatch() && imagesSpy.getMatchCount() > 0);

            // verify status code for all matching requests
            for (let match of imagesSpy.getMatchedRequests()) {
                assert.ok(match.response().ok());
            }
        });
    });
});
