import {Request, RespondOptions} from 'puppeteer';
import {Matcher} from './Matcher';

export interface Faker {
    getResponseFake(request: Request): RespondOptions;
    isMatch(matcher: Matcher, request: Request): boolean;
}
