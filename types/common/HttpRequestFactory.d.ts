import { Request, RespondOptions } from 'puppeteer';
import { IRequestLoaderFactory } from '../interface/IRequestLoaderFactory';
export declare class HttpRequestFactory implements IRequestLoaderFactory {
    private timeout;
    constructor(timeout?: number);
    createRequest(request: Request): Promise<RespondOptions & {
        body: string;
    }>;
    private convertHeaders;
}
