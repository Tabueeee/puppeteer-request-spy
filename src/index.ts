/* tslint:disable:variable-name */
import {HttpRequestFactory} from './common/HttpRequestFactory';
import {IRedirectionOptions} from './interface/IRedirectionOptions';
import {IRequestBlocker} from './interface/IRequestBlocker';
import {IRequestModifier} from './interface/IRequestModifier';
import {IRequestSpy} from './interface/IRequestSpy';
import {IResponseFaker} from './interface/IResponseFaker';
import {RequestBlocker} from './RequestBlocker';
import {RequestInterceptor} from './RequestInterceptor';
import {RequestModifier} from './RequestModifier';
import {RequestRedirector} from './RequestRedirector';
import {RequestSpy} from './RequestSpy';
import {ResponseFaker} from './ResponseFaker';
import {ResponseModifier} from './ResponseModifier';
import {RedirectionOptionFactory} from './types/RedirectionOptionFactory';
import {RequestMatcher} from './types/RequestMatcher';
import {ResponseModifierCallBack} from './types/ResponseModifierCallBack';

let ResponseModifierBound: new(patterns: Array<string> | string, responseModifierCallBack: ResponseModifierCallBack) => ResponseModifier =
    ResponseModifier.bind(null, new HttpRequestFactory());

export {
    HttpRequestFactory,
    RequestBlocker,
    RequestInterceptor,
    RequestModifier,
    RequestRedirector,
    RequestSpy,
    ResponseFaker,
    ResponseModifier,
    ResponseModifierBound,
    IRedirectionOptions,
    IRequestBlocker,
    IRequestModifier,
    IRequestSpy,
    IResponseFaker,
    RequestMatcher,
    RedirectionOptionFactory,
    ResponseModifierCallBack
};
