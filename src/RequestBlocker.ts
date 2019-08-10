import {Request} from 'puppeteer';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {IRequestBlocker} from './interface/IRequestBlocker';
import {RequestMatcher} from './types/RequestMatcher';

export class RequestBlocker implements IRequestBlocker {

    private urlsToBlock: Array<string> = [];

    public shouldBlockRequest(request: Request, matcher: RequestMatcher): boolean {
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
