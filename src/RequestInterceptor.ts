import {Request} from 'puppeteer';
import {Logger} from './common/Logger';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {VoidLogger} from './common/VoidLogger';
import {RequestSpy, ResponseFaker} from './interfaces';

export class RequestInterceptor {

    private requestSpies: Array<RequestSpy> = [];
    private responseFakers: Array<ResponseFaker> = [];
    private urlsToBlock: Array<string> = [];
    private matcher: (testString: string, pattern: string) => boolean;
    private logger: Logger;
    private urlAccessor: UrlAccessor | undefined;

    public constructor(matcher: (testString: string, pattern: string) => boolean, logger?: Logger) {
        if (typeof logger === 'undefined') {
            logger = new VoidLogger();
        }

        this.logger = logger;
        this.matcher = matcher;
    }

    public async intercept(interceptedRequest: Request): Promise<void> {
        this.matchSpies(interceptedRequest);

        if (this.shouldBlockRequest(interceptedRequest)) {
            await this.blockUrl(interceptedRequest);

            return;
        }

        let responseFaker: undefined | ResponseFaker = this.getMatchingResponseFaker(interceptedRequest);

        if (typeof responseFaker !== 'undefined') {
            await interceptedRequest.respond(responseFaker.getResponseFake(interceptedRequest));

            return;
        }

        await this.acceptUrl(interceptedRequest);
    }

    public addSpy(requestSpy: RequestSpy): void {
        this.requestSpies.push(requestSpy);
    }

    public addFaker(responseFaker: ResponseFaker): void {
        this.responseFakers.push(responseFaker);
    }

    public block(urls: Array<string> | string): void {
        this.urlsToBlock = this.urlsToBlock.concat(urls);
    }

    public clearSpies(): void {
        this.requestSpies = [];
    }

    public clearFakers(): void {
        this.responseFakers = [];
    }

    public clearUrlsToBlock(): void {
        this.urlsToBlock = [];
    }

    public setUrlsToBlock(urlsToBlock: Array<string>): void {
        this.urlsToBlock = urlsToBlock;
    }

    private getUrlAccessor(interceptedRequest: Request): UrlAccessor {
        if (typeof this.urlAccessor === 'undefined') {
            this.urlAccessor = UrlAccessorResolver.getUrlAccessor(interceptedRequest);
        }

        return this.urlAccessor;
    }

    private getMatchingResponseFaker(interceptedRequest: Request): ResponseFaker | undefined {
        let urlAccessor: UrlAccessor = this.getUrlAccessor(interceptedRequest);
        for (let requestInspector of this.responseFakers) {
            for (let pattern of requestInspector.getPatterns()) {
                if (this.matcher(urlAccessor.getUrlFromRequest(interceptedRequest), pattern)) {
                    return requestInspector;
                }
            }
        }

        return undefined;
    }

    private shouldBlockRequest(interceptedRequest: Request): boolean {
        let urlAccessor: UrlAccessor = this.getUrlAccessor(interceptedRequest);
        for (let urlToBlock of this.urlsToBlock) {
            if (this.matcher(urlAccessor.getUrlFromRequest(interceptedRequest), urlToBlock)) {
                return true;
            }
        }

        return false;
    }

    private matchSpies(interceptedRequest: Request): void {
        let urlAccessor: UrlAccessor = this.getUrlAccessor(interceptedRequest);
        for (let spy of this.requestSpies) {
            for (let pattern of spy.getPatterns()) {
                if (this.matcher(urlAccessor.getUrlFromRequest(interceptedRequest), pattern)) {
                    spy.addMatch(interceptedRequest);
                }
            }
        }
    }

    private async blockUrl(interceptedRequest: Request): Promise<void> {
        let urlAccessor: UrlAccessor = this.getUrlAccessor(interceptedRequest);
        try {
            await interceptedRequest.abort();
            this.logger.log(`aborted: ${urlAccessor.getUrlFromRequest(interceptedRequest)}`);
        } catch (error) {
            this.logger.log((<Error> error).toString());
        }
    }

    private async acceptUrl(interceptedRequest: Request): Promise<void> {
        let urlAccessor: UrlAccessor = this.getUrlAccessor(interceptedRequest);
        try {
            await interceptedRequest.continue();
            this.logger.log(`loaded: ${urlAccessor.getUrlFromRequest(interceptedRequest)}`);
        } catch (error) {
            this.logger.log((<Error> error).toString());
        }
    }
}
