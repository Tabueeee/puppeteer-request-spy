import * as assert from 'assert';
import {Request} from 'puppeteer';
import {RequestInterceptor, RequestMatcher, RequestSpy} from '../../src';
import {getRequestDouble} from '../common/testDoubleFactories';


describe('class: RequestSpy', async (): Promise<void> => {
    it('should ', async () => {
        let imageSpy: RequestSpy = new RequestSpy('images/');
        let keywordMatcher: RequestMatcher = (testString: string, pattern: string): boolean => testString.indexOf(pattern) > -1;
        let requestInterceptor: RequestInterceptor = new RequestInterceptor(keywordMatcher);
        requestInterceptor.addSpy(imageSpy);

        await simulateInterceptedRequests(requestInterceptor); // await page.goto('https://www.example.com');

        assert.ok(imageSpy.hasMatch());
        assert.strictEqual(imageSpy.getMatchCount(), 3);
        assert.ok(!imageSpy.getMatchedRequests()[0].failure());
    });
});


async function simulateInterceptedRequests(requestInterceptor: RequestInterceptor): Promise<void> {
    let requestMatchingSpy: Request = <Request>getRequestDouble('images/something.jpg');
    await requestInterceptor.intercept(requestMatchingSpy);
    await requestInterceptor.intercept(requestMatchingSpy);
    await requestInterceptor.intercept(requestMatchingSpy);
}
