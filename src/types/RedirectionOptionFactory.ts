import {Request} from 'puppeteer';
import {IRedirectionOptions} from '../';

export type RedirectionOptionFactory = (request: Request) => IRedirectionOptions;
