import * as assert from 'assert';
import {RequestSpy} from '../../src/RequestSpy';

describe('class: RequestSpy', function (): void {
    describe('happy path', function (): void {

        it('spy accepts single string pattern', function (): void {
            assert.doesNotThrow(() => {
                new RequestSpy('some-pattern/**/*').hasMatch();
            });
        });

        it('spy accepts multiple string patterns in an array', function (): void {
            assert.doesNotThrow(() => {
                new RequestSpy(['some-pattern/**/*', 'some-pattern/**/*', 'some-pattern/**/*']).hasMatch();
            });
        });

        it('spy returns accepted pattern', function (): void {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');
            assert.deepEqual(requestSpy.getPatterns(), ['some-pattern/**/*']);
        });

        it('multiple matched requests increase matchCount', function (): void {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatchedUrl('some-pattern/pattern');
            requestSpy.addMatchedUrl('some-pattern/pattern_2');

            assert.equal(requestSpy.getMatchCount(), 2, '');
        });

        it('multiple matched requests are stored in matchedUrls', function (): void {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatchedUrl('some-pattern/pattern');
            requestSpy.addMatchedUrl('some-pattern/pattern_2');

            assert.deepEqual(requestSpy.getMatchedUrls(), ['some-pattern/pattern', 'some-pattern/pattern_2'], '');
        });

        it('multiple matched requests sets matched to true', function (): void {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatchedUrl('some-pattern/pattern');
            requestSpy.addMatchedUrl('some-pattern/pattern_2');

            assert.equal(requestSpy.hasMatch(), true, '');
        });
    });

    describe('sad path', function (): void {
        it('spy rejects other input', function (): void {
            assert.throws(() => {
                // @ts-ignore: ignore error to test invalid input from js
                new RequestSpy(3).hasMatch();
            });
        });
    });
});
