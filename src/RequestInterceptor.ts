import {Overrides, Request, RespondOptions} from 'puppeteer';
import {instanceOfRequestBlocker} from './common/interfaceValidators/instanceOfRequestBlocker';
import {instanceOfRequestFaker} from './common/interfaceValidators/instanceOfRequestFaker';
import {instanceOfRequestModifier} from './common/interfaceValidators/instanceOfRequestModifier';
import {instanceOfRequestSpy} from './common/interfaceValidators/instanceOfRequestSpy';
import {ILogger} from './common/Logger';
import {resolveOptionalPromise} from './common/resolveOptionalPromise';
import {UrlAccessor} from './common/urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './common/urlAccessor/UrlAccessorResolver';
import {VoidLogger} from './common/VoidLogger';
import {IRequestBlocker} from './interface/IRequestBlocker';
import {IRequestModifier} from './interface/IRequestModifier';
import {IRequestSpy} from './interface/IRequestSpy';
import {IResponseFaker} from './interface/IResponseFaker';
import {RequestBlocker} from './RequestBlocker';
import {RequestMatcher} from './types/RequestMatcher';

export class RequestInterceptor {

    private requestSpies: Array<IRequestSpy> = [];
    private responseFakers: Array<IResponseFaker> = [];
    private requestModifiers: Array<IRequestModifier> = [];
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

        let responseFaker: undefined | IResponseFaker = await this.getMatchingFaker(interceptedRequest);

        if (typeof responseFaker !== 'undefined') {
            this.logger.log(`faked: ${interceptedRequest.url()}`);
            let responseFake: RespondOptions | Promise<RespondOptions> = responseFaker.getResponseFake(interceptedRequest);
            await interceptedRequest.respond(await resolveOptionalPromise<RespondOptions>(responseFake));

            return;
        }

        let requestOverride: Overrides | undefined;

        for (let requestModifier of this.requestModifiers) {
            if (requestModifier.isMatchingRequest(interceptedRequest, this.matcher)) {
                requestOverride = requestModifier.getOverride(interceptedRequest);
            }
        }

        await this.acceptUrl(interceptedRequest, requestOverride);
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

    public addRequestModifier(requestModifier: IRequestModifier): void {
        if (!instanceOfRequestModifier(requestModifier)) {
            throw new Error('invalid RequestModifier provided. Please make sure to match the interface provided.');
        }

        this.requestModifiers.push(requestModifier);
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

    public clearRequestModifiers(): void {
        this.requestModifiers = [];
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

    private async getMatchingFaker(interceptedRequest: Request): Promise<IResponseFaker | undefined> {
        for (let faker of this.responseFakers) {
            let matches: (Promise<boolean> | boolean) = faker.isMatchingRequest(interceptedRequest, this.matcher);

            if (await resolveOptionalPromise<boolean>(matches)) {
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

    private async acceptUrl(interceptedRequest: Request, requestOverride: Overrides | undefined): Promise<void> {
        let urlAccessor: UrlAccessor = this.getUrlAccessor(interceptedRequest);
        try {
            if (typeof requestOverride !== 'undefined') {
                this.logger.log(`redirected: ${urlAccessor.getUrlFromRequest(interceptedRequest)} to ${requestOverride.url}`);
                await interceptedRequest.continue(requestOverride);
            } else {
                this.logger.log(`loaded: ${urlAccessor.getUrlFromRequest(interceptedRequest)}`);
                await interceptedRequest.continue();
            }

        } catch (error) {
            this.logger.log((<Error> error).toString());
        }
    }
}
