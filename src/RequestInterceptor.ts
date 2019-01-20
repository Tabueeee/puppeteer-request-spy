import {Request} from 'puppeteer';
import {instanceOfRequestBlocker} from './common/interfaceValidators/instanceOfRequestBlocker';
import {instanceOfRequestFaker} from './common/interfaceValidators/instanceOfRequestFaker';
import {instanceOfRequestSpy} from './common/interfaceValidators/instanceOfRequestSpy';
import {ILogger} from './common/Logger';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {VoidLogger} from './common/VoidLogger';
import {IRequestBlocker} from './interface/IRequestBlocker';
import {IResponseFaker} from './interface/IRequestFaker';
import {IRequestSpy} from './interface/IRequestSpy';
import {RequestMatcher} from './interface/RequestMatcher';
import {RequestBlocker} from './RequestBlocker';

export class RequestInterceptor {

    private requestSpies: Array<IRequestSpy> = [];
    private responseFakers: Array<IResponseFaker> = [];
    private matcher: RequestMatcher;
    private logger: ILogger;
    private urlAccessor: UrlAccessor | undefined;
    private requestBlocker: IRequestBlocker;

    public constructor(matcher: RequestMatcher, logger?: ILogger) {
        if (typeof logger === 'undefined') {
            logger = new VoidLogger();
        }

        this.logger = logger;
        this.matcher = matcher;
        this.requestBlocker = new RequestBlocker();
    }

    public async intercept(interceptedRequest: Request): Promise<void> {
        this.matchSpies(interceptedRequest);

        if (this.requestBlocker.shouldBlockRequest(interceptedRequest, this.matcher)) {
            await this.blockUrl(interceptedRequest);

            return;
        }

        let responseFaker: undefined | IResponseFaker = this.getMatchingFaker(interceptedRequest);

        if (typeof responseFaker !== 'undefined') {
            await interceptedRequest.respond(responseFaker.getResponseFake(interceptedRequest));

            return;
        }

        await this.acceptUrl(interceptedRequest);
    }

    public addSpy(requestSpy: IRequestSpy): void {
        if (!instanceOfRequestSpy(requestSpy)) {
            throw new Error('invalid RequestSpy provided. Please make sure to match the interface provided.');
        }

        this.requestSpies.push(requestSpy);
    }

    public addFaker(responseFaker: IResponseFaker): void {
        if (!instanceOfRequestFaker(responseFaker)) {
            throw new Error('invalid RequestFaker provided. Please make sure to match the interface provided.');
        }

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

    public setRequestBlocker(requestBlocker: IRequestBlocker): void {
        if (!instanceOfRequestBlocker(requestBlocker)) {
            throw new Error('invalid RequestBlocker provided. Please make sure to match the interface provided.');
        }

        this.requestBlocker = requestBlocker;
    }

    private getUrlAccessor(interceptedRequest: Request): UrlAccessor {
        if (typeof this.urlAccessor === 'undefined') {
            this.urlAccessor = UrlAccessorResolver.getUrlAccessor(interceptedRequest);
        }

        return this.urlAccessor;
    }

    private getMatchingFaker(interceptedRequest: Request): IResponseFaker | undefined {
        for (let faker of this.responseFakers) {
            if (faker.isMatchingRequest(interceptedRequest, this.matcher)) {
                return faker;
            }
        }

        return undefined;
    }

    private matchSpies(interceptedRequest: Request): void {
        for (let spy of this.requestSpies) {
            if (spy.isMatchingRequest(interceptedRequest, this.matcher)) {
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
