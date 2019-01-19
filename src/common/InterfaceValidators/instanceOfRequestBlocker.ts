import {RequestBlocker} from '../../interface/RequestBlocker';

export function instanceOfRequestBlocker(object: object): object is RequestBlocker {
    return typeof (<RequestBlocker>object).shouldBlockRequest === 'function'
           && typeof (<RequestBlocker>object).clearUrlsToBlock === 'function'
           && typeof (<RequestBlocker>object).addUrlsToBlock === 'function';
}
