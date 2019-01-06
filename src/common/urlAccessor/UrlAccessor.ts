import {Request} from 'puppeteer';

export abstract class UrlAccessor {
    public abstract getUrlFromRequest(request: Request): string;
}
