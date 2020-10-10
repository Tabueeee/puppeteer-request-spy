import { Request } from 'puppeteer';
export declare type ResponseModifierCallBack = (err: Error | undefined, response: string, request: Request) => string | Promise<string>;
