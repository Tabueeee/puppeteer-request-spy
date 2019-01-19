import {Request, RespondOptions} from 'puppeteer';
import {IResponseFaker, RequestMatcher} from '../../src';

export class CustomFaker implements IResponseFaker {

    public getResponseFake(request: Request): RespondOptions {
        if (request.method() === 'GET') {
            return {
                status: 200,
                contentType: 'text/plain',
                body: 'Just a mock!'
            };
        }

        return {
            status: 404,
            contentType: 'text/plain',
            body: 'Not Found!'
        };
    }

    public isMatchingRequest(request: Request, matcher: RequestMatcher): boolean {
        return matcher(request.url(), '**/remote.html');
    }
}
