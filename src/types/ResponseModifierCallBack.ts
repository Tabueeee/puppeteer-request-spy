import {Request} from 'puppeteer';

export type ResponseModifierCallBack = (err: Error | undefined, response: string, request: Request) => string | Promise<string>;
