import {Request} from 'puppeteer';
import {UrlAccessor} from './UrlAccessor';

export class UrlStringAccessor extends UrlAccessor {
    public getUrlFromRequest(request: Request): string {
        // @ts-ignore: support old puppeteer version
        return request.url;
    }
}
