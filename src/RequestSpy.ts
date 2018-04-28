import {RequestInspector} from './RequestInspector';

export class RequestSpy extends RequestInspector {

    private hasMatchingUrl: boolean = false;
    private matchedUrls: Array<string> = [];
    private matchCount: number = 0;

    public constructor(patterns: Array<string> | string) {
        super(patterns);
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
}
