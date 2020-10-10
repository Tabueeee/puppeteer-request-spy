export interface ServerSettings {
    rootPath: string;
    port: number;
    host: string;
}

export const serverSettings: ServerSettings = {
    rootPath: 'test/integration/fakes',
    port: 1337,
    host: 'localhost'
};
