import {IResponseFaker} from '../../';

export function instanceOfRequestFaker(object: object): object is IResponseFaker {
    return typeof (<IResponseFaker>object).getResponseFake === 'function'
           && typeof (<IResponseFaker>object).isMatchingRequest === 'function';
}
