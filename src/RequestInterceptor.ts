import {Request} from 'puppeteer';
import {instanceOfRequestBlocker} from './common/InterfaceValidators/instanceOfRequestBlocker';
import {Logger} from './common/Logger';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {VoidLogger} from './common/VoidLogger';
import {Faker} from './interface/Faker';
import {Matcher} from './interface/Matcher';
import {RequestBlocker} from './interface/RequestBlocker';
import {Spy} from './interface/Spy';
import {UrlRequestBlocker} from './UrlRequestBlocker';

export class RequestInterceptor {

    private requestSpies: Array<Spy> = [];
    private responseFakers: Array<Faker> = [];
    private matcher: Matcher;
    private logger: Logger;
    private urlAccessor: UrlAccessor | undefined;
    private requestBlocker: RequestBlocker;

    public constructor(matcher: Matcher, logger?: Logger) {
        if (typeof logger === 'undefined') {
            logger = new VoidLogger();
        }

        this.logger = logger;
        this.matcher = matcher;
        this.requestBlocker = new UrlRequestBlocker();
    }

    public async intercept(interceptedRequest: Request): Promise<void> {
        this.matchSpies(interceptedRequest);

        if (this.requestBlocker.shouldBlockRequest(this.matcher, interceptedRequest)) {
            await this.blockUrl(interceptedRequest);

            return;
        }

        let responseFaker: undefined | Faker = this.getMatchingFaker(interceptedRequest);

        if (typeof responseFaker !== 'undefined') {
            await interceptedRequest.respond(responseFaker.getResponseFake(interceptedRequest));

            return;
        }

        await this.acceptUrl(interceptedRequest);
    }

    public addSpy(requestSpy: Spy): void {
        this.requestSpies.push(requestSpy);
    }

    public addFaker(responseFaker: Faker): void {
        this.responseFakers.push(responseFaker);
    }

    public block(urlsToBlock: Array<string> | string): void {
        this.requestBlocker.addUrlsToBlock(urlsToBlock);
    }

    public clearSpies(): void {
        this.requestSpies = [];
    }

    public clearFakers(): void {
        this.responseFakers = [];
    }

    public clearUrlsToBlock(): void {
        this.requestBlocker.clearUrlsToBlock();
    }

    public setUrlsToBlock(urlsToBlock: Array<string>): void {
        this.requestBlocker.clearUrlsToBlock();
        this.requestBlocker.addUrlsToBlock(urlsToBlock);
    }

    public setRequestBlocker(requestBlocker: RequestBlocker): void {
        if (instanceOfRequestBlocker(requestBlocker)) {
            this.requestBlocker = requestBlocker;
        } else {
            throw new Error('invalid requestBlocker. make sure to implement the interface correctly.');
        }
    }

    private getUrlAccessor(interceptedRequest: Request): UrlAccessor {
        if (typeof this.urlAccessor === 'undefined') {
            this.urlAccessor = UrlAccessorResolver.getUrlAccessor(interceptedRequest);
        }

        return this.urlAccessor;
    }

    private getMatchingFaker(interceptedRequest: Request): Faker | undefined {
        for (let faker of this.responseFakers) {
            if (faker.isMatch(this.matcher, interceptedRequest)) {
                return faker;
            }
        }

        return undefined;
    }

    private matchSpies(interceptedRequest: Request): void {
        for (let spy of this.requestSpies) {
            if (spy.isMatch(this.matcher, interceptedRequest)) {
                spy.addMatch(interceptedRequest);
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
