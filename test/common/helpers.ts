import {Request} from 'puppeteer';

export function getUrlsFromRequestArray(requests: Array<Request>): Array<string> {
    let arr: Array<string> = [];
    for (let request of requests) {
        arr.push(request.url());
    }

    return arr;
}
