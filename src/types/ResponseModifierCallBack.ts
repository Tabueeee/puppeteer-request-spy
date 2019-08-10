import {Request, RespondOptions} from 'puppeteer';

export type ResponseModifierCallBack = (response: Buffer, request: Request) => RespondOptions;
