const puppeteer          = require('puppeteer');
const RequestInterceptor = require('puppeteer-request-spy').RequestInterceptor;
const ResponseFaker      = require('puppeteer-request-spy').ResponseFaker;
const minimatch          = require('minimatch');
const assert             = require('assert');
const fs                 = require('fs');

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
    let defaultPicture;
    let jsonResponseFaker;
    let imageResponseFaker;
    let textResponseFaker;
    let htmlResponseFaker;

    before(() => {
        requestInterceptor = new RequestInterceptor(minimatch, console);
        defaultPicture     = fs.readFileSync('./some-picture.png');
        imageResponseFaker = new ResponseFaker('**/*.jpg', {
            status: 200,
            contentType: 'image/png',
            body: defaultPicture
        });

        textResponseFaker = new ResponseFaker('**/some-path', {
            status: 200,
            contentType: 'text/plain',
            body: 'some static text'
        });

        htmlResponseFaker = new ResponseFaker('**/some-path', {
            status: 200,
            contentType: 'text/html',
            body: '<div>some static html</div>'
        });

        jsonResponseFaker = new ResponseFaker('**/*.jpg', {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({data: []})
        });

        requestInterceptor.addFaker(imageResponseFaker);
        requestInterceptor.addFaker(textResponseFaker);
        requestInterceptor.addFaker(htmlResponseFaker);
        requestInterceptor.addFaker(jsonResponseFaker);
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

            let ajaxContent = await page.evaluate(() => {
                return document.getElementById('some-id').innerHTML;
            });

            assert.strictEqual(ajaxContent, '<div>some static html</div>');
        });
    });
});
