import {Request} from 'puppeteer';
import {RespondOptions} from 'puppeteer';
import {IResponseFaker, RequestMatcher} from 'puppeteer-request-spy';

export class CustomFaker implements IResponseFaker {

    private patterns: Array<string> = [];
    private fakesMap = {
        'GET': 'some text',
        'POST': 'Not Found!'
    };

    public constructor(patterns: Array<string>) {
        this.patterns = patterns;
    }

    public getResponseFake(request: Request): RespondOptions {
        return {
            status: 200,
            contentType: 'text/plain',
            body: this.fakesMap[request.method()]
        };
    }

    public isMatchingRequest(request: Request, matcher: RequestMatcher): boolean {
        for (let pattern of this.patterns) {
            if(matcher(request.url(), pattern)){

                return true;
            }
        }

        return false;
    }
}
