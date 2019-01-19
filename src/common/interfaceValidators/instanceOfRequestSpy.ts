import {IRequestSpy} from '../../';

export function instanceOfRequestSpy(object: object): object is IRequestSpy {
    return typeof (<IRequestSpy>object).addMatch === 'function'
           && typeof (<IRequestSpy>object).isMatchingRequest === 'function';
}
