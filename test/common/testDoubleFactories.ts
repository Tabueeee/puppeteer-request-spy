import * as nock from 'nock';
import {Overrides, Request, RespondOptions} from 'puppeteer';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';
import {RequestModifier} from '../../src';
import {HttpRequestFactory} from '../../src/common/HttpRequestFactory';
import {ILogger} from '../../src/common/Logger';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {serverSettings} from './ServerSettings';
import {TestDouble} from './TestDouble';

export function getRequestSpyDouble(matches: boolean): TestDouble<RequestSpy> {
    return {
        isMatchingRequest: sinon.stub().returns(matches),
        addMatch: sinon.spy(),
        hasMatch: undefined,
        getMatchedUrls: undefined,
        getMatchCount: undefined
    };
}

export function getRequestModifierDouble(matches: boolean, override: Overrides): TestDouble<RequestModifier> {
    return {
        isMatchingRequest: sinon.stub().returns(matches),
        getOverride: sinon.stub().returns(override)
    };
}

export function getRequestDouble(url: string = 'any-url', requestMock?: { nock(): void, requestCount: number }): TestDouble<Request> {
    if (typeof requestMock !== 'undefined') {
        for (let index: number = 0; index < requestMock.requestCount; index++) {
            requestMock.nock();
        }
    }

    return {
        continue: sinon.spy(),
        abort: sinon.spy(),
        respond: sinon.spy(),
        url: (): string => url,
        method: (): string => 'GET',
        failure: (): boolean => false,
        headers: (): { [index: string]: string } => ({
            'test-header-single': 'val',
            'test-header-multi': 'val, val2',
            'text-header-empty': ''
        }),
        postData: (): { [index: string]: string } => ({})
    };
}

export function getHttpRequestFactoryDouble(fakeResponse: string, spy?: SinonSpy): TestDouble<HttpRequestFactory> {
    return {
        createRequest: (request: Request): RespondOptions => {
            if (typeof spy !== 'undefined') {
                spy(request);
            }

            return {
                status: 200,
                body: fakeResponse,
                contentType: 'text/plain'
            };
        }
    };
}

export function getLowVersionRequestDouble(): TestDouble<Request> {
    return {
        continue: sinon.spy(),
        abort: sinon.spy(),
        respond: sinon.spy(),
        url: 'any-url'
    };
}

export function getResponseFakerDouble(matches: boolean): TestDouble<ResponseFaker> {
    return {
        getResponseFake: sinon.spy(),
        isMatchingRequest: sinon.stub().returns(matches)
    };
}

export function getErrorRequestDouble(): TestDouble<Request> {
    return {
        continue: async (): Promise<void> => {
            throw new Error('requestInterception is not set');
        },
        abort: async (): Promise<void> => {
            throw new Error('requestInterception is not set');
        },
        respond: async (): Promise<void> => {
            throw new Error('requestInterception is not set');
        },
        url: (): string => 'any-url'
    };
}

const FAVICON_URL: string = `http://${serverSettings.host}/favicon.ico`;

export function getLoggerFake(arrayPointer: Array<string>): ILogger {
    return {
        log: (log: string): void => {
            if (log !== FAVICON_URL) {
                arrayPointer.push(log);
            }
        }
    };
}

export function respondingNock(path: string, bodyPrefix: string): void {
    nock('http://www.example.com')
        .get(`/${path}`)
        .reply(200, `${bodyPrefix} response body`, {'content-type': 'text/html'});
}
