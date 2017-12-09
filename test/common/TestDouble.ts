// noinspection TsLint
export type TestDouble<T> = {
    [P in keyof T]?: any;
    };
