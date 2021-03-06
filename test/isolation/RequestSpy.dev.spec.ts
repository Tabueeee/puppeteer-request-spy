import * as assert from 'assert';
import {Request} from 'puppeteer';
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
            assert.deepStrictEqual(requestSpy.getPatterns(), ['some-pattern/**/*']);
        });

        it('multiple matched requests increases matchCount', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatch(<Request> {url: (): string => 'some-pattern/pattern'});
            requestSpy.addMatch(<Request> {url: (): string => 'some-pattern/pattern_2'});

            assert.strictEqual(requestSpy.getMatchCount(), 2, '');
        });

        it('multiple matched requests are stored in matchedUrls', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatch(<Request> {url: (): string => 'some-pattern/pattern'});
            requestSpy.addMatch(<Request> {url: (): string => 'some-pattern/pattern_2'});

            let matches: Array<Request> = requestSpy.getMatchedRequests();

            let expected: Array<{url: string}> = [
                {url: 'some-pattern/pattern'},
                {url: 'some-pattern/pattern_2'}
            ];

            let actual: Array<{url: string}> = [];

            for (let match of matches) {
                actual.push({url: match.url()});
            }

            assert.deepStrictEqual(
                actual,
                expected,
                'requestSpy didn\'t add all urls'
            );

            assert.deepStrictEqual(requestSpy.getMatchedUrls(), ['some-pattern/pattern', 'some-pattern/pattern_2'], '');
        });

        it('multiple matched requests sets matched to true', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            requestSpy.addMatch(<Request> {url: (): string => 'some-pattern/pattern'});
            requestSpy.addMatch(<Request> {url: (): string => 'some-pattern/pattern_2'});

            assert.strictEqual(requestSpy.hasMatch(), true, '');
        });

        it('confirms request matches when matcher function matches', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            assert.deepStrictEqual(requestSpy.isMatchingRequest((<Request>{url: (): string => ''}), () => true), true);
        });

        it('confirms request does not matches when matcher function does not match', (): void => {
            let requestSpy: RequestSpy = new RequestSpy('some-pattern/**/*');

            assert.deepStrictEqual(requestSpy.isMatchingRequest((<Request>{url: (): string => ''}), () => false), false);
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
