/// <reference types="node" />
import { Request } from 'puppeteer';
export declare class HttpRequestFactory {
    private timeout;
    constructor(timeout?: number);
    createOriginalResponseLoaderFromRequest(request: Request): () => Promise<Buffer>;
    createResponseLoader(request: Request, urlString: string): () => Promise<Buffer>;
}
