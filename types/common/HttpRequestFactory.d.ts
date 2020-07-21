import { Request, RespondOptions } from 'puppeteer';
export declare class HttpRequestFactory {
    private timeout;
    constructor(timeout?: number);
    createOriginalResponseLoaderFromRequest(request: Request): () => Promise<RespondOptions>;
    createResponseLoader(request: Request, urlString: string): () => Promise<RespondOptions>;
}
