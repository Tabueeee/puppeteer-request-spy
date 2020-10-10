import { Request, RespondOptions } from 'puppeteer';
export interface IRequestFactory {
    createRequest(request: Request): Promise<RespondOptions & {
        body: string;
    }>;
}
