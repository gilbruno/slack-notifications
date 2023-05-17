import util from 'util'

export class Cache<U> {
    private cache: any;

    constructor(name: string, duration?: number) {
        this.cache = require('persistent-cache')({
            base: '.cache',
            name: name,
            duration: duration || 1000 * 3600 * 24 * 360
        });
    }

    /**
     * get list of keys
     */
    keysSync(): Array<string> {
        return this.cache.keysSync();
    }

    async keys(): Promise<Array<string>> {
        return await util.promisify(this.cache.keys)();
    }

    /**
     * get data on disk
     */
    getSync<T>(key: U): T {
        return this.cache.getSync(key);
    }

    async get<T>(key: U): Promise<T> {
        return await util.promisify(this.cache.get)(key);
    }

    /**
     * set data on disk
     */
    setSync<T>(key: U, data: T) {
        this.cache.putSync(key, data);
    }

    async set<T>(key: U, data: T) {
        await util.promisify(this.cache.put)(key, data);
    }

    /**
     * delete data on disk
     */
     deleteSync(key: U) {
        this.cache.deleteSync(key);
    }

    async delete(key: U) {
        await util.promisify(this.cache.delete)(key);
    }
}
