export async function resolveOptionalPromise<T>(subject: T | Promise<T>): Promise<T> {
    if (typeof subject === 'object' && subject instanceof Promise) {
        return await subject;
    }

    return subject;
}
