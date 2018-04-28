export abstract class RequestInspector {

    private patterns: Array<string> = [];

    public constructor(patterns: Array<string> | string) {
        if (typeof patterns !== 'string' && patterns.constructor !== Array) {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }

        if (typeof patterns === 'string') {
            patterns = [patterns];
        }

        this.patterns = patterns;
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }
}
