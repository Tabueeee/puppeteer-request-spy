import { Request } from 'puppeteer';
import { UrlAccessor } from './UrlAccessor';
export declare class UrlFunctionAccessor extends UrlAccessor {
    getUrlFromRequest(request: Request): string;
}
