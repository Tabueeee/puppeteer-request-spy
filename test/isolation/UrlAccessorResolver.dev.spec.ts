import * as assert from 'assert';
import * as clearModule from 'clear-module';
import {Request} from 'puppeteer';
import {UrlAccessor} from '../../src/common/urlAccessor/UrlAccessor';
import {UrlFunctionAccessor} from '../../src/common/urlAccessor/UrlFunctionAccessor';
import {UrlStringAccessor} from '../../src/common/urlAccessor/UrlStringAccessor';
import {TestDouble} from '../common/TestDouble';
import {getLowVersionRequestDouble, getRequestDouble} from '../common/testDoubleFactories';

describe('module: UrlAccessorResolver', (): void => {
    beforeEach(() => {
        clearModule('../../src/common/urlAccessor/UrlAccessorResolver');
    });

    afterEach(() => {
        clearModule('../../src/common/urlAccessor/UrlAccessorResolver');
    });

    it('old puppeteer version resolves to UrlStringAccessor', async (): Promise<void> => {
        let request: TestDouble<Request> = getLowVersionRequestDouble();
        let UrlAccessorResolver: any = (await import('../../src/common/urlAccessor/UrlAccessorResolver')).UrlAccessorResolver;
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(<Request> request);

        assert.ok(urlAccessor instanceof UrlStringAccessor);
        assert.strictEqual(urlAccessor.getUrlFromRequest(<Request> request), 'any-url');
    });

    it('new puppeteer version resolves to UrlFunctionAccessor', async (): Promise<void> => {
        let request: TestDouble<Request> = getRequestDouble();
        let UrlAccessorResolver: any = (await import('../../src/common/urlAccessor/UrlAccessorResolver')).UrlAccessorResolver;
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(<Request> request);

        assert.ok(urlAccessor instanceof UrlFunctionAccessor);
        assert.strictEqual(urlAccessor.getUrlFromRequest(<Request> request), 'any-url');
    });
});
