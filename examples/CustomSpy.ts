import {IRequestSpy, RequestMatcher} from 'puppeteer-request-spy';
import {Request, Response} from 'puppeteer';
import * as assert from "assert";


export class CustomSpy implements IRequestSpy {
    private matches: Array<Request> = [];

    public isMatchingRequest(request: Request, matcher: RequestMatcher): boolean {

        return matcher(request.url(), '**/*');
    }

    public addMatch(matchedRequest: Request): void {

        this.matches.push(matchedRequest);
    }

    public assertRequestsOk() {
        for (let match of this.matches) {
            let response: Response | null = match.response();
            if (response !== null) {
                assert.ok(response.ok());
            }
        }
    }
}
