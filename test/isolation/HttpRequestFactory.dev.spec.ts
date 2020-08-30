import * as assert from 'assert';
import * as nock from 'nock';
import {Request, RespondOptions} from 'puppeteer';
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
                .reply(200, 'path matched', {'content-type': 'text/plain'});

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let loader: () => Promise<RespondOptions> = httpRequestFactory.createResponseLoader(
                <Request>getRequestDouble(),
                'http://www.example.com/resource'
            );
            let response: RespondOptions = await loader();

            assert.deepStrictEqual(response, {
                body: 'path matched',
                contentType: 'text/plain',
                headers: {
                    'content-type': 'text/plain'
                },
                status: 200
            });
        });


        it('should create correct headers from response', async () => {
            nock('http://www.example.com')
                .get('/resource')
                .reply(
                    200,
                    () => 'path matched',
                    // @ts-ignore
                    {
                        'content-type': 'text/plain',
                        'test-header-single': 'val',
                        'test-header-multi': ['val', 'val2'],
                        'text-header-empty': undefined
                    }
                );

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let loader: () => Promise<RespondOptions> = httpRequestFactory.createResponseLoader(
                <Request>getRequestDouble(),
                'http://www.example.com/resource'
            );
            let response: RespondOptions = await loader();

            assert.deepStrictEqual(response, {
                body: 'path matched',
                contentType: 'text/plain',
                headers: {
                    'content-type': 'text/plain',
                    'test-header-single': 'val',
                    'test-header-multi': 'val, val2',
                    'text-header-empty': ''
                },
                status: 200
            });
        });


        it('should create a promise based loader from a request', async () => {
            // noinspection TsLint
            nock('http://www.example.com')
                .get('/resource')
                .reply(200, 'path matched', {'content-type': 'text/plain'});

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let loader: () => Promise<RespondOptions> = httpRequestFactory.createOriginalResponseLoaderFromRequest(
                <Request>{
                    url: (): string => 'http://www.example.com/resource', method: (): string => 'GET',
                    headers: (): { [index: string]: string } => ({})
                }
            );
            let response: RespondOptions = await loader();

            assert.deepStrictEqual(response, {
                body: 'path matched',
                contentType: 'text/plain',
                headers: {
                    'content-type': 'text/plain'
                },
                status: 200
            });
        });
    });
    describe('sad path', () => {
        it('should throw if timeout is reached', async () => {
            // noinspection TsLint
            nock('http://www.example.com')
                .get('/resource')
                .delay(7)
                .reply(200, 'path matched');

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory(5);
            let loader: () => Promise<RespondOptions> = httpRequestFactory.createResponseLoader(
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
