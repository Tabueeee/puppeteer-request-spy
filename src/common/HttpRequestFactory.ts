import Timeout = NodeJS.Timeout;
import {ClientRequest, IncomingMessage, request as httpRequest, RequestOptions} from 'http';
import {Request} from 'puppeteer';
import {URL} from 'url';
import {UrlAccessor} from './urlAccessor/UrlAccessor';
import {UrlAccessorResolver} from './urlAccessor/UrlAccessorResolver';

export class HttpRequestFactory {
    private timeout: number;

    public constructor(timeout: number = 30000) {
        this.timeout = timeout;
    }

    public createOriginalResponseLoaderFromRequest(request: Request): () => Promise<Buffer> {
        let urlAccessor: UrlAccessor = UrlAccessorResolver.getUrlAccessor(request);

        return this.createResponseLoader(request, urlAccessor.getUrlFromRequest(request));
    }

    public createResponseLoader(request: Request, urlString: string): () => Promise<Buffer> {
        return (): Promise<Buffer> => {
            return new Promise((resolve: (body: Buffer) => void, reject: (error: Error) => void): void => {
                let url: URL = new URL(urlString);

                let headers: { [index: string]: string } = {};
                Object.assign(headers, request.headers);

                let options: RequestOptions = {
                    method: request.method(),
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    headers: headers
                };

                let timeout: Timeout = setTimeout(
                    () => {
                        reject(new Error('request timed out after 30 seconds.'));
                    },
                    this.timeout
                );

                let req: ClientRequest = httpRequest(options, (res: IncomingMessage) => {
                    let chunks: Array<Buffer> = [];

                    res.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                    });

                    res.on('end', () => {
                        let body: Buffer = Buffer.concat(chunks);
                        clearTimeout(timeout);
                        // {body, res.headers['content-type'];, headers, res.statusCode}
                        resolve(body);
                    });
                });

                req.end();
            });
        };
    }
}
