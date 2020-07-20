import * as assert from 'assert';
import {Request} from 'puppeteer';
import {RequestModifier} from '../../src/RequestModifier';
import {getRequestDouble} from '../common/testDoubleFactories';

describe('class: RequestModifier', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                // noinspection TsLint
                new RequestModifier('some-pattern/**/*', {});
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                // noinspection TsLint
                new RequestModifier(['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'], {});
            });
        });

        it('returns accepted fake', async (): Promise<void> => {
            let responseFaker: RequestModifier = new RequestModifier('some-pattern/**/*', {
                url: '',
                method: 'GET',
                postData: '',
                headers: {}
            });

            assert.deepStrictEqual(await responseFaker.getOverride(<Request> getRequestDouble()), {
                url: '',
                method: 'GET',
                postData: '',
                headers: {}
            });
        });


        it('returns accepted fake', async (): Promise<void> => {
            let responseFaker: RequestModifier = new RequestModifier('some-pattern/**/*', (request: Request) => ({
                url: request.url(),
                method: 'GET',
                postData: '',
                headers: {}
            }));

            assert.deepStrictEqual(await responseFaker.getOverride(<Request> getRequestDouble()), {
                url: 'any-url',
                method: 'GET',
                postData: '',
                headers: {}
            });
        });

        it('returns accepted patterns', (): void => {
            let responseFaker: RequestModifier = new RequestModifier('some-pattern/**/*', {
                url: '',
                method: 'GET',
                postData: '',
                headers: {}
            });

            assert.deepStrictEqual(responseFaker.getPatterns(), ['some-pattern/**/*']);
        });

        it('confirms request matches when matcher function matches', (): void => {
            let responseFaker: RequestModifier = new RequestModifier('some-pattern/**/*', {
                url: '',
                method: 'GET',
                postData: '',
                headers: {}
            });

            assert.deepStrictEqual(responseFaker.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let responseFaker: RequestModifier = new RequestModifier('some-pattern/**/*', {
                url: '',
                method: 'GET',
                postData: '',
                headers: {}
            });

            assert.deepStrictEqual(responseFaker.isMatchingRequest((<Request>{url: (): string => ''}), () => false), false);
        });
    });

    describe('sad path', (): void => {
        it('rejects other input', (): void => {
            assert.throws((): void => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestModifier(3, {}).getPatterns();
            });
        });
    });
});
