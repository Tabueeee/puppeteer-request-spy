import {Request, RespondOptions} from 'puppeteer';
import {ResponseFaker as IResponseFaker} from './interfaces';

type RespondOptionsGetter = (request: Request) => RespondOptions;

export class ResponseFaker implements IResponseFaker {

    private responseFake: RespondOptionsGetter;
    private patterns: Array<string> = [];

    public constructor(patterns: Array<string> | string, responseFake: RespondOptions | RespondOptionsGetter) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
        if (typeof responseFake === 'function') {
            this.responseFake = responseFake;
        } else {
            this.responseFake = (): RespondOptions => responseFake;
        }
    }

    public getResponseFake(request: Request): RespondOptions {
        return this.responseFake(request);
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }
}
