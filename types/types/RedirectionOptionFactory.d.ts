import { Request } from 'puppeteer';
import { IRedirectionOptions } from '../';
export declare type RedirectionOptionFactory = (request: Request) => IRedirectionOptions;
