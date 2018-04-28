import {RespondOptions} from 'puppeteer';
import {RequestInspector} from './RequestInspector';

export class ResponseFaker extends RequestInspector {

    private responseFake: RespondOptions;

    public constructor(patterns: Array<string> | string, responseFake: RespondOptions) {
        super(patterns);
        this.responseFake = responseFake;
    }

    public getResponseFake(): RespondOptions {
        return this.responseFake;
    }
}
