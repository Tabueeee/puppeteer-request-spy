import {Request} from 'puppeteer';

export type ResponseModifierCallBack = (response: string, request: Request) => string | Promise<string>;
