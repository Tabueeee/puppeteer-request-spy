import { Request, RespondOptions } from 'puppeteer';
import { IRequestFactory } from '../interface/IRequestFactory';
export declare class HttpRequestFactory implements IRequestFactory {
    private timeout;
    constructor(timeout?: number);
    createRequest(request: Request): Promise<RespondOptions & {
        body: string;
    }>;
    private convertHeaders;
}
