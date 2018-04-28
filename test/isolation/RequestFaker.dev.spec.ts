import * as assert from 'assert';
import {ResponseFaker} from '../../src/ResponseFaker';

describe('class: ResponseFaker', (): void => {
    describe('happy path', (): void => {

        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                new ResponseFaker('some-pattern/**/*', {}).getPatterns();
            });
        });

        it('accepts multiple string patterns as array', (): void => {
            assert.doesNotThrow(() => {
                new ResponseFaker(['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*'], {}).getPatterns();
            });
        });

        it('returns accepted patterns', (): void => {
            let responseFaker: ResponseFaker = new ResponseFaker('some-pattern/**/*', {
                status: 200,
                contentType: 'plain/text',
                body: 'payload'
            });

            assert.deepEqual(responseFaker.getResponseFake(), {
                status: 200,
                contentType: 'plain/text',
                body: 'payload'
            });
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
