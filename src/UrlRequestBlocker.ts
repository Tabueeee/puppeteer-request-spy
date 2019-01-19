import {Request} from 'puppeteer';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {Matcher} from './interface/Matcher';
import {RequestBlocker} from './interface/RequestBlocker';

export class UrlRequestBlocker implements RequestBlocker {

    private urlsToBlock: Array<string> = [];

    public shouldBlockRequest(matcher: Matcher, request: Request): boolean {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(request);

        for (let urlToBlock of this.urlsToBlock) {
            if (matcher(urlAccessor.getUrlFromRequest(request), urlToBlock)) {
                return true;
            }
        }

        return false;
    }

    public addUrlsToBlock(urls: Array<string> | string): void {
        this.urlsToBlock = this.urlsToBlock.concat(urls);
    }

    public clearUrlsToBlock(): void {
        this.urlsToBlock = [];
    }
}
