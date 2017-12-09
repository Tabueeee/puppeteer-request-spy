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

export const serverSettings: ServerSettings = {
    rootPath: 'test/integration/fakes', // required, the root of the server file tree
    port: 1337,
    host: '127.0.0.1',
    templates: {
        index: 'index.html'
    }
};
