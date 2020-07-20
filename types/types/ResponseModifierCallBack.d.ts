/// <reference types="node" />
import { Request, RespondOptions } from 'puppeteer';
export declare type ResponseModifierCallBack = (response: Buffer, request: Request) => RespondOptions;
