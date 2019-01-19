import {Request} from 'puppeteer';
import * as sinon from 'sinon';
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

export function getRequestDouble(): TestDouble<Request> {
    return {
        continue: sinon.spy(),
        abort: sinon.spy(),
        respond: sinon.spy(),
        url: (): string => 'any-url'
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

export function getRequestFakerDouble(matches: boolean): TestDouble<ResponseFaker> {
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
