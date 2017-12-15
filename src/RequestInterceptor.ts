import {Request} from 'puppeteer';
import {Logger} from './common/Logger';
import {VoidLogger} from './common/VoidLogger';
import {RequestSpy} from './RequestSpy';

export class RequestInterceptor {

    private spies: Array<RequestSpy> = [];
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
        let aborted: boolean = false;

        for (let spy of this.spies) {
            for (let pattern of spy.getPatterns()) {
                if (this.matcher(interceptedUrl.url, pattern)) {
                    spy.addMatchedUrl(interceptedUrl.url);
                }
            }
        }

        for (let urlToBlock of this.urlsToBlock) {
            if (this.matcher(interceptedUrl.url, urlToBlock)) {
                aborted = true;
                await this.blockUrl(interceptedUrl);
            }
        }

        if (aborted === false) {
            await this.acceptUrl(interceptedUrl);
        }
    }

    public addSpy(requestSpy: RequestSpy): void {
        this.spies.push(requestSpy);
    }

    public block(urls: Array<string> | string): void {
        this.urlsToBlock = this.urlsToBlock.concat(urls);
    }

    public clearSpies(): void {
        this.spies = [];
    }

    public clearUrlsToBlock(): void {
        this.urlsToBlock = [];
    }

    public setUrlsToBlock(urlsToBlock: Array<string>): void {
        this.urlsToBlock = urlsToBlock;
    }

    private async blockUrl(interceptedUrl: Request): Promise<void> {
        try {
            await interceptedUrl.abort();
            this.logger.log(`aborted: ${interceptedUrl.url}`);
        } catch (error) {
            this.logger.log((<Error> error).toString());
        }
    }

    private async acceptUrl(interceptedUrl: Request): Promise<void> {
        if (this.urlsToBlock.length > 0) {
            try {
                await interceptedUrl.continue();
                this.logger.log(`loaded: ${interceptedUrl.url}`);
            } catch (error) {
                this.logger.log((<Error> error).toString());
            }
        } else {
            this.logger.log(`loaded: ${interceptedUrl.url}`);
        }
    }
}
