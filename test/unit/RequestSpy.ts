import * as assert from 'assert';
import {RequestSpy} from '../../src/RequestSpy';
import {getUrlsFromRequestArray} from '../common/helpers';

export async function requestSpyTestCases (requestSpy: RequestSpy): Promise<void> {
    it('should have recognized a match', () => {
        assert.ok(requestSpy.hasMatch(), 'requestSpy did not match url');
    });

    it('should have a matchCount of 3', () => {
        assert.strictEqual(requestSpy.getMatchCount(), 3, 'requestSpy did not increase count on match');

    });

    it('should return passed pattern as Array', () => {
        assert.deepStrictEqual(requestSpy.getPatterns(), ['spy']);

    });

    it('should return passed patterns as Array', () => {
        let requestSpyWithArray: RequestSpy = new RequestSpy(['some/pattern/**/*']);
        assert.deepStrictEqual(requestSpyWithArray.getPatterns(), ['some/pattern/**/*']);
    });

    it('should retrieve expected urls from matched Requests', () => {
        assert.deepStrictEqual(
            getUrlsFromRequestArray(requestSpy.getMatchedRequests()),
            [
                'spy',
                'spy',
                'spy'
            ],
            'requestSpy didn\'t add all urls'
        );
    });

    it('should provide urls as an Array', () => {
        assert.deepStrictEqual(
            requestSpy.getMatchedUrls(),
            [
                'spy',
                'spy',
                'spy'
            ],
            'requestSpy didn\'t add all urls'
        );
    });

    it('should throw an Error on invalid patterns', () => {
        assert.throws(() => {
            // @ts-ignore: ignore error to test invalid input from js
            // noinspection TsLint
            new RequestSpy(3);
        });
    });
}
