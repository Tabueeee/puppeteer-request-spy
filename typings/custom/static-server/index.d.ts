declare module 'static-server' {
    export = StaticServer;

    class StaticServer {
        constructor(serverSettings: StaticServer.ServerSettings);

        public stop(): void;

        public start(cb: () => void): void;
    }

    namespace StaticServer {
        export interface ServerSettings {
            rootPath: string;
            port: number;
            host: string;
            templates: ServerSettingTemplates;
        }

        export interface ServerSettingTemplates {
            index: string;
            notFound?: string;
        }
    }
}
