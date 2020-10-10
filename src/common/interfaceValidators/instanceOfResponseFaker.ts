import {IResponseFaker} from '../../';

export function instanceOfResponseFaker(object: object): object is IResponseFaker {
    return typeof (<IResponseFaker>object).getResponseFake === 'function'
           && typeof (<IResponseFaker>object).isMatchingRequest === 'function';
}
