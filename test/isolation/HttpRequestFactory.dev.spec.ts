import * as assert from 'assert';
import * as nock from 'nock';
import {HttpHeaders} from 'nock';
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
            let response: RespondOptions = await httpRequestFactory.createRequest(
                <Request>getRequestDouble('http://www.example.com/resource')
            );

            assert.deepStrictEqual(response, {
                body: 'path matched',
                contentType: 'text/plain',
                headers: {
                    'content-type': 'text/plain'
                },
                status: 200
            });
        });

        it('should create a promise based loader from a https url string', async () => {
            // noinspection TsLint
            nock('https://www.example.com')
                .get('/resource')
                .reply(200, 'path matched', {'content-type': 'text/plain'});

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let response: RespondOptions = await httpRequestFactory.createRequest(
                <Request>getRequestDouble('https://www.example.com/resource')
            );

            assert.deepStrictEqual(response, {
                body: 'path matched',
                contentType: 'text/plain',
                headers: {
                    'content-type': 'text/plain'
                },
                status: 200
            });
        });


        it('should create a promise based loader from an url string with get params', async () => {
            // noinspection TsLint
            nock('https://www.example.com')
                .get('/resource?some=1&get=params')
                .reply(200, 'path matched', {'content-type': 'text/plain'});

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let response: RespondOptions = await httpRequestFactory.createRequest(
                <Request>getRequestDouble('https://www.example.com/resource?some=1&get=params')
            );

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
            let headers: HttpHeaders = <HttpHeaders><unknown>{
                'content-type': 'text/plain',
                'test-header-single': 'val',
                'test-header-multi': ['val', 'val2'],
                'text-header-empty': undefined
            };

            nock('http://www.example.com')
                .get('/resource')
                .reply(
                    200,
                    () => 'path matched',
                    headers
                );

            let httpRequestFactory: HttpRequestFactory = new HttpRequestFactory();
            let response: RespondOptions = await httpRequestFactory.createRequest(
                <Request>getRequestDouble('http://www.example.com/resource')
            );

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
            let response: RespondOptions = await httpRequestFactory.createRequest(
                <Request>{
                    url: (): string => 'http://www.example.com/resource', method: (): string => 'GET',
                    headers: (): { [index: string]: string } => ({})
                }
            );

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
            await assertThrowsAsync(
                async () => {
                    await httpRequestFactory.createRequest(
                        <Request>getRequestDouble('http://www.example.com/resource')
                    );
                },
                /Error/
            );
        });
    });
});
