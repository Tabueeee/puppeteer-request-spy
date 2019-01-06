import {Request} from 'puppeteer';
import {UrlAccessor} from './UrlAccessor';

export class UrlFunctionAccessor extends UrlAccessor {
    public getUrlFromRequest(request: Request): string {
        return request.url();
    }
}
