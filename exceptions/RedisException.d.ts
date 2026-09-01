/** Error thrown for Redis failures, carrying an optional HTTP-style status code. */
export default class RedisException extends Error {
    code: number;
    /**
     * @param {string} message - Error message describing the failure.
     * @param {number} code - Status code, defaults to 503.
     */
    constructor(message?: string, code?: number);
}
