import {RespondOptions} from 'puppeteer';
import {ResponseFaker as IResponseFaker} from './interfaces';

export class ResponseFaker implements IResponseFaker {

    private responseFake: RespondOptions;
    private patterns: Array<string> = [];

    public constructor(patterns: Array<string> | string, responseFake: RespondOptions) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        this.responseFake = responseFake;
    }

    public getResponseFake(): RespondOptions {
        return this.responseFake;
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }
}
