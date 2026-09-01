import Logger from "@bejibun/logger";
import { defineValue } from "@bejibun/utils";
/** Error thrown for Redis failures, carrying an optional HTTP-style status code. */
export default class RedisException extends Error {
    code;
    /**
     * @param {string} message - Error message describing the failure.
     * @param {number} code - Status code, defaults to 503.
     */
    constructor(message, code) {
        super(message);
        this.name = "RedisException";
        this.code = defineValue(code, 503);
        Logger.setContext(this.name).error(this.message).trace(this.stack);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RedisException);
        }
    }
}
