import {Request, RespondOptions} from 'puppeteer';

/**
 * A RequestPatternSelector checks whether it is responsible for a request based on pattern strings
 */
export interface RequestPatternSelector {
    /**
     * Returns for which patterns the RequestSelector is responsible
     */
    getPatterns(): Array<string>;
}

/**
 * A RequestSpy checks for requests and collects which of these were made
 */
export interface RequestSpy extends RequestPatternSelector {
    /**
     * React to requests.
     * @param matchedRequest - The request to react to
     */
    addMatch(matchedRequest: Request): void;
}

/**
 * A ResponseFaker checks for requests and fakes the response
 */
export interface ResponseFaker extends RequestPatternSelector {
    /**
     * Return the fake response
     */
    getResponseFake(): RespondOptions;
}
