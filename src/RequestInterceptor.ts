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
        await this.matchSpies(interceptedRequest);

        if (await resolveOptionalPromise<boolean>(this.requestBlocker.shouldBlockRequest(interceptedRequest, this.matcher))) {
            await this.blockUrl(interceptedRequest);

            return;
        }

        let responseFaker: undefined | IResponseFaker = await this.getMatchingFaker(interceptedRequest);

        if (typeof responseFaker !== 'undefined') {
            let responseFake: RespondOptions | Promise<RespondOptions> = responseFaker.getResponseFake(interceptedRequest);
            await interceptedRequest.respond(await resolveOptionalPromise<RespondOptions>(responseFake));
            this.logger.log(`faked: ${interceptedRequest.url()}`);

            return;
        }

        let requestOverride: Overrides | undefined = await this.getMatchingOverride(interceptedRequest);

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

    private async getMatchingFaker(interceptedRequest: Request): Promise<IResponseFaker | undefined> {
        for (let faker of this.responseFakers) {
            if (await resolveOptionalPromise<boolean>(faker.isMatchingRequest(interceptedRequest, this.matcher))) {
                return faker;
            }
        }

        return undefined;
    }

    private async matchSpies(interceptedRequest: Request): Promise<void> {
        for (let spy of this.requestSpies) {
            if (await resolveOptionalPromise<boolean>(spy.isMatchingRequest(interceptedRequest, this.matcher))) {
                await resolveOptionalPromise(spy.addMatch(interceptedRequest));
            }
        }
    }

    private async getMatchingOverride(interceptedRequest: Request): Promise<Overrides | undefined> {
        let requestOverride: Overrides | undefined;

        for (let requestModifier of this.requestModifiers) {
            if (await resolveOptionalPromise<boolean>(requestModifier.isMatchingRequest(interceptedRequest, this.matcher))) {
                requestOverride = await resolveOptionalPromise<Overrides>(requestModifier.getOverride(interceptedRequest));
            }
        }

        return requestOverride;
    }

    private async blockUrl(interceptedRequest: Request): Promise<void> {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(interceptedRequest);

        try {
            await interceptedRequest.abort();
            this.logger.log(`aborted: ${urlAccessor.getUrlFromRequest(interceptedRequest)}`);
        } catch (error) {
            this.logger.log((<Error>error).toString());
        }
    }

    private async acceptUrl(interceptedRequest: Request, requestOverride?: Overrides): Promise<void> {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(interceptedRequest);

        try {
            if (typeof requestOverride !== 'undefined') {
                await interceptedRequest.continue(requestOverride);
                this.logger.log(`redirected: ${urlAccessor.getUrlFromRequest(interceptedRequest)} to ${requestOverride.url}`);
            } else {
                await interceptedRequest.continue();
                this.logger.log(`loaded: ${urlAccessor.getUrlFromRequest(interceptedRequest)}`);
            }
        } catch (error) {
            this.logger.log((<Error>error).toString());
        }
    }
}
