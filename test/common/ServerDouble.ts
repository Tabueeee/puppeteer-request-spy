import {serverSettings} from './ServerSettings';
import {testServer} from './testServer';

export class ServerDouble {
    // tslint:disable-next-line:no-any
    private server: any;

    public async start(): Promise<{}> {
        return new Promise((resolve: () => void): void => {
            this.server = testServer.listen(serverSettings.port);
            resolve();
        });
    }

    public stop(): void {
        this.server.close();
    }
}

export const serverDouble: ServerDouble = new ServerDouble();
