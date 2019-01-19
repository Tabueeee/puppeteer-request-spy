import { Request } from 'puppeteer';
export declare abstract class UrlAccessor {
    abstract getUrlFromRequest(request: Request): string;
}
