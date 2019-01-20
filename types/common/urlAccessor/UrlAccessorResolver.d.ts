import { Request } from 'puppeteer';
import { UrlAccessor } from './UrlAccessor';
export declare module UrlAccessorResolver {
    function getUrlAccessor(interceptedRequest: Request): UrlAccessor;
}
