import {Request, RespondOptions} from 'puppeteer';

export interface IRequestFactory {
    /**
     * @param request <Request>: puppeteers Request object
     * @return Overrides: RespondOptions as defined by puppeteer but with mandatory body string
     *
     * loads a http request in the node environment
     */
    createRequest(request: Request): Promise<RespondOptions & { body: string }>;
}
