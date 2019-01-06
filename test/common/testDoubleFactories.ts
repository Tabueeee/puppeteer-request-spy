import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {Logger} from '../../src/common/Logger';
import {RequestSpy} from '../../src/RequestSpy';
import {ResponseFaker} from '../../src/ResponseFaker';
import {serverSettings} from './ServerSettings';
import {TestDouble} from './TestDouble';

export function getRequestSpyDouble(): TestDouble<RequestSpy> {
    return {
        getPatterns: sinon.stub().returns(['']),
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

export function getRequestFakerDouble(): TestDouble<ResponseFaker> {
    return {
        getResponseFake: sinon.spy(),
        getPatterns: sinon.stub().returns([''])
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
export function getLoggerFake(arrayPointer: Array<string>): Logger {
    return {
        log: (log: string): void => {
            if (log !== FAVICON_URL) {
                arrayPointer.push(log);
            }
        }
    };
}
