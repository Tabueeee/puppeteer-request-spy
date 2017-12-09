import * as StaticServer from 'static-server';
import {serverSettings} from './ServerSettings';

export class ServerDouble {

    private server: StaticServer;

    public constructor() {
        this.server = new StaticServer(serverSettings);
    }

    public async start(): Promise<{}> {
        return new Promise((resolve: () => void): void => {
            this.server.start(function (): void {
                resolve();
            });
        });
    }

    public stop(): void {
        this.server.stop();
    }
}

export const serverDouble: ServerDouble = new ServerDouble();
