import * as fs from 'fs';
import * as Koa from 'koa';
import {ExtendableContext} from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as mime from 'mime-types';
import * as path from 'path';
import {serverSettings} from './ServerSettings';
import Timer = NodeJS.Timer;


function buildTestServer(): Koa {
    let app: Koa = new Koa();

    app.use(bodyParser());


    async function wait(time: number): Promise<void> {
        return new Promise(((resolve: () => void): Timer => setTimeout(resolve, time)));
    }


    app.use(async (ctx: ExtendableContext, next: () => Promise<void>) => {
        await next();

        if (ctx.path === '/test-post-unavailable') {
            await wait(20);
        }
    });


    app.use(async (ctx: ExtendableContext, next: () => Promise<void>) => {
        await next();
        if (!ctx.body) {
            ctx.body = 'ServerDouble: 404!';
        }
    });


    app.use(async (ctx: ExtendableContext, next: () => Promise<void>) => {
        const ROOT_DIR: string = path.resolve(global.process.cwd(), serverSettings.rootPath);
        let requestPath: string = path.join(ROOT_DIR, ctx.path.replace('/fakes/', ''));

        if (fs.existsSync(requestPath)) {
            ctx.type = mime.lookup(requestPath) || 'text/plain';
            ctx.body = fs.readFileSync(requestPath);
        }

        await next();
    });


    app.use(async (ctx: ExtendableContext, next: () => Promise<void>) => {

        if (ctx.path === '/test-post-fake') {
            ctx.status = 200;
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({a: ctx.request.body.a * 1, n: ctx.request.body.n * 1}, null, 2);

            return;
        }

        if (ctx.path === '/test-post-real') {
            ctx.status = 200;
            ctx.type = 'application/json';
            ctx.body = JSON.stringify({a: ctx.request.body.a * 100, n: ctx.request.body.n * 100}, null, 2);

            return;
        }

        await next();
    });

    app.use(async (ctx: ExtendableContext) => {
        if (ctx.path === '/show-headers-real') {
            ctx.status = 200;
            ctx.type = 'application/json';
            ctx.body = JSON.stringify(ctx.request.headers, null, 2);
        }

        if (ctx.path === '/show-headers-fake') {
            ctx.status = 200;
            ctx.type = 'application/json';
            ctx.body = JSON.stringify(ctx.request.headers, null, 2);
        }

        return;
    });

    return app;
}


export const testServer: Koa = buildTestServer();
