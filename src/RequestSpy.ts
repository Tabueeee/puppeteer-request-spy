export class RequestSpy {

    private hasMatchingUrl: boolean = false;
    private matchedUrls: Array<string> = [];
    private matchCount: number = 0;
    private patterns: Array<string> = [];

    public constructor(patterns: Array<string> | string) {
        if (typeof patterns === 'string') {
            this.patterns = [patterns];
        } else if (patterns.constructor === Array) {
            this.patterns = patterns;
        } else {
            throw new Error('invalid pattern, pattern must be of type string or string[].');
        }
    }

    public hasMatch(): boolean {
        return this.hasMatchingUrl;
    }

    public getMatchedUrls(): Array<string> {
        return this.matchedUrls;
    }

    public getMatchCount(): number {
        return this.matchCount;
    }

    public addMatchedUrl(interceptedRequest: string): void {
        this.hasMatchingUrl = true;
        this.matchedUrls.push(interceptedRequest);
        this.matchCount++;
    }

    public getPatterns(): Array<string> {
        return this.patterns;
    }
}
