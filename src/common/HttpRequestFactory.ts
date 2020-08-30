import {ClientRequest, IncomingHttpHeaders, IncomingMessage, request as httpRequest, RequestOptions} from 'http';
import {Request, RespondOptions} from 'puppeteer';
import {URL} from 'url';
import {UrlAccessor} from './urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './urlAccessor/UrlAccessorResolver';

export class HttpRequestFactory {
    private timeout: number;

    public constructor(timeout: number = 30000) {
        this.timeout = timeout;
    }

    public createOriginalResponseLoaderFromRequest(request: Request): () => Promise<RespondOptions> {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(request);

        return this.createResponseLoader(request, urlAccessor.getUrlFromRequest(request));
    }

    public createResponseLoader(request: Request, urlString: string): () => Promise<RespondOptions> {
        return (): Promise<RespondOptions> => {
            return new Promise((resolve: (options: RespondOptions) => void, reject: (error: Error) => void): void => {
                let url: URL = new URL(urlString);

                let headers: { [index: string]: string } = {};
                Object.assign(headers, request.headers());

                let options: RequestOptions = {
                    method: request.method(),
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    headers: headers
                };

                let timeout: NodeJS.Timeout;
                let req: ClientRequest = httpRequest(options, (res: IncomingMessage) => {

                    let chunks: Array<Buffer> = [];

                    res.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                    });

                    res.on('end', () => {
                        let body: Buffer = Buffer.concat(chunks);

                        clearTimeout(timeout);

                        resolve(
                            {
                                body: body.toString(),
                                contentType: res.headers['content-type'],
                                status: res.statusCode,
                                headers: Object
                                    .keys(res.headers)
                                    .reduce(this.convertHeaders.bind(this, res.headers), {})
                            }
                        );
                    });
                });

                timeout = setTimeout(
                    () => {
                        req.end();
                        reject(new Error(`unable to load: ${url}. request timed out after ${this.timeout / 1000} seconds.`));
                    },
                    this.timeout
                );

                req.end();
            });
        };
    }

    private convertHeaders(
        responseHeaders: IncomingHttpHeaders,
        prev: { [index: string]: string },
        key: string
    ): { [index: string]: string } {
        let currentHeader: string | Array<string> | undefined = responseHeaders[key];

        if (typeof currentHeader === 'string') {
            prev[key] = currentHeader;
        } else if (Array.isArray(currentHeader)) {
            prev[key] = currentHeader.join(', ');
        } else {
            prev[key] = '';
        }

        return prev;
    }
}
