import {Request} from 'puppeteer';
import {UrlAccessor} from './UrlAccessor';
import {UrlFunctionAccessor} from './UrlFunctionAccessor';
import {UrlStringAccessor} from './UrlStringAccessor';

export module UrlAccessorResolver {
    let accessor: UrlAccessor;

    export function getUrlAccessor(interceptedRequest: Request): UrlAccessor {
        if (accessor instanceof UrlAccessor === false) {
            if (typeof interceptedRequest.url === 'string') {
                accessor = new UrlStringAccessor();
            } else {
                accessor = new UrlFunctionAccessor();
            }
        }

        return accessor;
    }
}
