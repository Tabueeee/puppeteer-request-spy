import { Request } from 'puppeteer';
import { UrlAccessor } from './UrlAccessor';
export declare class UrlStringAccessor extends UrlAccessor {
    getUrlFromRequest(request: Request): string;
}
