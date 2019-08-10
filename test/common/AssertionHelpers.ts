import * as assert from 'assert';

export async function assertThrowsAsync(fn: () => void, regExp: RegExp): Promise<void> {
    // noinspection TsLint
    let f: () => void = (): void => {
    };
    try {
        await fn();
    } catch (e) {
        f = (): void => {
            throw e;
        };
    } finally {
        assert.throws(f, regExp);
    }
}

export async function assertDoesNotThrowAsync(fn: () => void, regExp: RegExp): Promise<void> {
    // noinspection TsLint
    let f: () => void = (): void => {
    };
    try {
        await fn();
    } catch (e) {
        f = (): void => {
            throw e;
        };
    } finally {
        assert.doesNotThrow(f, regExp);
    }
}
