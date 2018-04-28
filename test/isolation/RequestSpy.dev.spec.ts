import * as assert from 'assert';
import {RequestSpy} from '../../src/RequestSpy';

describe('class: RequestSpy', (): void => {
    describe('happy path', (): void => {
        it('accepts single string pattern', (): void => {
            assert.doesNotThrow((): void => {
                new RequestSpy('some-pattern/**/*').hasMatch();
            });
        });

        it('accepts multiple string patterns in an array', (): void => {
            assert.doesNotThrow(() => {
                new RequestSpy(['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*']).hasMatch();
            });
        });

        it('returns accepted pattern', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');
            assert.deepEqual(requestSpy.getPatterns(), ['some-pattern/**/*']);
        });

        it('multiple matched requests increases matchCount', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatchedUrl('some-pattern/pattern');
            requestSpy.addMatchedUrl('some-pattern/pattern_2');

            assert.equal(requestSpy.getMatchCount(), 2, '');
        });

        it('multiple matched requests are stored in matchedUrls', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatchedUrl('some-pattern/pattern');
            requestSpy.addMatchedUrl('some-pattern/pattern_2');

            assert.deepEqual(requestSpy.getMatchedUrls(), ['some-pattern/pattern', 'some-pattern/pattern_2'], '');
        });

        it('multiple matched requests sets matched to true', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatchedUrl('some-pattern/pattern');
            requestSpy.addMatchedUrl('some-pattern/pattern_2');

            assert.equal(requestSpy.hasMatch(), true, '');
        });
    });

    describe('sad path', (): void => {
        it('rejects other input', (): void => {
            assert.throws((): void => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestSpy(3).hasMatch();
            });
        });
    });
});
