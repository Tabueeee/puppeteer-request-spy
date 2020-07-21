import { Request } from 'puppeteer';
export declare type ResponseModifierCallBack = (response: string, request: Request) => string | Promise<string>;
