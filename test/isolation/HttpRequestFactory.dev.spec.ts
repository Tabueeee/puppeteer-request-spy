import * as assert from 'assert';
import * as nock from 'nock';
import {Request} from 'puppeteer';
import {HttpRequestFactory} from '../../src/common/HttpRequestFactory';
import {assertThrowsAsync} from '../common/AssertionHelpers';
import {getRequestDouble} from '../common/testDoubleFactories';


describe('class: HttpRequestFactory', () => {

    before(() => {
        if (!nock.isActive()) {
            nock.activate();
        }
        nock.disableNetConnect();
    });

    after(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        nock.restore();
    });

    describe('happy path', () => {
        it('should create a promise based loader from an url string', async () => {
            // noinspection TsLint
            nock('http://www.example.com')
                .get('/resource')
                .reply(200, 'path matched');

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let loader: () => Promise<Buffer> = httpRequestFactory.createResponseLoader(
                <Request>getRequestDouble(),
                'http://www.example.com/resource'
            );
            let response: Buffer = await loader();

            assert.strictEqual(response.toString(), 'path matched');
        });

        it('should create a promise based loader from a request', async () => {
            // noinspection TsLint
            nock('http://www.example.com')
                .get('/resource')
                .reply(200, 'path matched');

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let loader: () => Promise<Buffer> = httpRequestFactory.createOriginalResponseLoaderFromRequest(
                <Request>{url: (): string => 'http://www.example.com/resource', method: (): string => 'GET'}
            );
            let response: Buffer = await loader();

            assert.strictEqual(response.toString(), 'path matched');
        });
    });
    describe('sad path', () => {
        it('should throw if timeout is reached', async () => {
            // noinspection TsLint
            nock('http://www.example.com')
                .get('/resource')
                .delay(20)
                .reply(200, 'path matched');

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory(15);
            let loader: () => Promise<Buffer> = httpRequestFactory.createResponseLoader(
                <Request>getRequestDouble(),
                'http://www.example.com/resource'
            );
            await assertThrowsAsync(
                async () => {
                    await loader();
                },
                /Error/
            );
        });
    });
});
