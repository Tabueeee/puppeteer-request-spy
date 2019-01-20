import {IRequestBlocker} from '../../interface/IRequestBlocker';

export function instanceOfRequestBlocker(object: object): object is IRequestBlocker {
    return typeof (<IRequestBlocker>object).shouldBlockRequest === 'function'
           && typeof (<IRequestBlocker>object).clearUrlsToBlock === 'function'
           && typeof (<IRequestBlocker>object).addUrlsToBlock === 'function';
}
