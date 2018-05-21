import {Request} from 'puppeteer';
import {Logger} from './common/Logger';
import {VoidLogger} from './common/VoidLogger';
import {RequestSpy} from './RequestSpy';
import {ResponseFaker} from './ResponseFaker';

export class RequestInterceptor {

    private requestSpies: Array<RequestSpy> = [];
    private responseFakers: Array<ResponseFaker> = [];
    private urlsToBlock: Array<string> = [];
    private matcher: (testString: string, pattern: string) => boolean;
    private logger: Logger;

    public constructor(matcher: (testString: string, pattern: string) => boolean, logger?: Logger) {
        if (typeof logger === 'undefined') {
            logger = new VoidLogger();
        }

        this.logger = logger;
        this.matcher = matcher;
    }

    public async intercept(interceptedUrl: Request): Promise<void> {
        let url: string;

        if (typeof interceptedUrl.url === 'string') {
            // @ts-ignore: support old puppeteer version
            url = interceptedUrl.url;
        } else {
            url = interceptedUrl.url();
        }

        for (let spy of this.requestSpies) {
            for (let pattern of spy.getPatterns()) {
                if (this.matcher(url, pattern)) {
                    spy.addMatchedUrl(url);
                }
            }
        }

        let aborted: boolean = false;
        for (let urlToBlock of this.urlsToBlock) {
            if (this.matcher(url, urlToBlock)) {
                aborted = true;
            }
        }

        if (aborted === true) {
            await this.blockUrl(interceptedUrl, url);

            return;
        }

        let responseFaker: undefined | ResponseFaker;
        for (let requestInspector of this.responseFakers) {
            for (let pattern of requestInspector.getPatterns()) {
                if (this.matcher(url, pattern)) {
                    responseFaker = requestInspector;
                }
            }
        }

        if (typeof responseFaker !== 'undefined') {
            await interceptedUrl.respond(responseFaker.getResponseFake());

            return;
        }

        await this.acceptUrl(interceptedUrl, url);
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

    private async blockUrl(interceptedUrl: Request, url: string): Promise<void> {
        try {
            await interceptedUrl.abort();
            this.logger.log(`aborted: ${url}`);
        } catch (error) {
            this.logger.log((<Error> error).toString());
        }
    }

    private async acceptUrl(interceptedUrl: Request, url: string): Promise<void> {
        if (this.urlsToBlock.length > 0) {
            try {
                await interceptedUrl.continue();
                this.logger.log(`loaded: ${url}`);
            } catch (error) {
                this.logger.log((<Error> error).toString());
            }
        } else {
            await interceptedUrl.continue();
            this.logger.log(`loaded: ${url}`);
        }
    }
}
