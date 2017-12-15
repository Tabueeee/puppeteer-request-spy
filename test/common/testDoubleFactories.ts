import {Request} from 'puppeteer';
import * as sinon from 'sinon';
import {Logger} from '../../src/common/Logger';
import {RequestSpy} from '../../src/RequestSpy';
import {TestDouble} from './TestDouble';

export function getRequestSpyDouble(): TestDouble<RequestSpy> {
    return {
        getPatterns: sinon.stub().returns(['']),
        addMatchedUrl: sinon.spy(),
        hasMatch: undefined,
        getMatchedUrls: undefined,
        getMatchCount: undefined
    };
}

export function getRequestDouble(): TestDouble<Request> {
    return {
        continue: sinon.spy(),
        abort: sinon.spy(),
        url: 'any-url'
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
        url: 'any-url'
    };
}

export function getLoggerFake(arrayPointer: Array<string>): Logger {
    return {
        log: (log: string): void => {
            if (log !== 'http://127.0.0.1:1337/favicon.ico') {
                arrayPointer.push(log);
            }
        }
    };
}
