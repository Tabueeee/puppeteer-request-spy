import {Request, RespondOptions} from 'puppeteer';

export interface IRequestLoaderFactory {
    createRequest(request: Request): Promise<RespondOptions & { body: string }>;
}
