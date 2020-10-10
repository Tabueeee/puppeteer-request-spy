import * as assert from 'assert';
import {Request, RespondOptions} from 'puppeteer';
import {ResponseFaker} from '../../src/ResponseFaker';
import {getRequestDouble} from '../common/testDoubleFactories';

describe('class: ResponseFaker', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                // noinspection TsLint
                new ResponseFaker('some-pattern/**/*', {});
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                // noinspection TsLint
                new ResponseFaker(['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'], {});
            });
        });

        it('returns accepted fake', async (): Promise<void> => {
            let responseFaker: ResponseFaker = new ResponseFaker('some-pattern/**/*', {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            });

            assert.deepStrictEqual(await responseFaker.getResponseFake((<Request> getRequestDouble())), {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            });
        });


        it('returns accepted fake', async (): Promise<void> => {
            let responseFaker: ResponseFaker = new ResponseFaker('some-pattern/**/*', (): RespondOptions => ({
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            }));

            assert.deepStrictEqual(await responseFaker.getResponseFake((<Request> getRequestDouble())), {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            });
        });

        it('returns accepted patterns', (): void => {
            let responseFaker: ResponseFaker = new ResponseFaker('some-pattern/**/*', {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            });

            assert.deepStrictEqual(responseFaker.getPatterns(), ['some-pattern/**/*']);
        });

        it('confirms request matches when matcher function matches', (): void => {
            let responseFaker: ResponseFaker = new ResponseFaker('some-pattern/**/*', {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            });

            assert.deepStrictEqual(responseFaker.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let responseFaker: ResponseFaker = new ResponseFaker('some-pattern/**/*', {
                status: 200,
                contentType: 'text/plain',
                body: 'payload'
            });

            assert.deepStrictEqual(responseFaker.isMatchingRequest((<Request>{url: (): string => ''}), () => false), false);
        });
    });

    describe('sad path', (): void => {
        it('rejects other input', (): void => {
            assert.throws((): void => {
                // @ts-ignore: ignore error to test invalid input from js
                new ResponseFaker(3, {}).getPatterns();
            });
        });
    });
});
