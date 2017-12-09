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
    // noinspection TsLint
    return {
        'continue': sinon.spy(),
        abort: sinon.spy(),
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
