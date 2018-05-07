export class RequestSpy {

    private hasMatchingUrl: boolean = false;
    private matchedUrls: Array<string> = [];
    private matchCount: number = 0;
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

    public hasMatch(): boolean {
        return this.hasMatchingUrl;
    }

    public getMatchedUrls(): Array<string> {
        return this.matchedUrls;
    }

    public getMatchCount(): number {
        return this.matchCount;
    }

    public addMatchedUrl(matchedUrl: string): void {
        this.hasMatchingUrl = true;
        this.matchedUrls.push(matchedUrl);
        this.matchCount++;
    }
}
