import type { RedisConfig, RedisPipeline, RedisSubscribe } from "../types/redis";
/** Provides low-level Redis operations, connection management, pub/sub, and pipelines. */
export default class RedisBuilder {
    private static clients;
    private static emitter;
    /**
     * Creates and registers a client for the given configuration and returns bound command wrappers.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @param {string} name - Optional connection name; defaults to the configured default connection.
     * @returns {Record<string, (...args: Array<any>) => {}>} Map of command names to bound functions.
     */
    static setClient(cfg: RedisConfig, name?: string): Record<string, (...args: Array<any>) => {}>;
    /**
     * Returns command wrappers bound to an existing named connection.
     *
     * @param {string} name - Connection name.
     * @returns {Record<string, (...args: Array<any>) => {}>} Map of command names to bound functions.
     */
    static connection(name: string): Record<string, (...args: Array<any>) => {}>;
    /**
     * Connects the client for the given connection and emits a connect event.
     *
     * @param {string} name - Optional connection name; defaults to the configured default.
     * @returns {Promise<Bun.RedisClient>} The connected Redis client.
     */
    static connect(name?: string): Promise<Bun.RedisClient>;
    /**
     * Closes and unregisters a single named connection, or all connections when no name is given.
     *
     * @param {string} name - Optional connection name.
     */
    static disconnect(name?: string): Promise<void>;
    /**
     * Pings the server, returning the response or false on failure.
     *
     * @param {Bun.RedisClient.KeyLike} message - Optional message to send with the ping.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<string | boolean>} The ping response, or false when the ping fails.
     */
    static ping(message?: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<string | boolean>;
    /**
     * Returns all keys matching the given pattern.
     *
     * @param {string} pattern - Glob-style key pattern.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<Array<string>>} Array of matching keys, or an empty array on failure.
     */
    static keys(pattern: string, connection?: string, disconnectAfter?: boolean): Promise<Array<string>>;
    /**
     * Gets and deserializes the value stored at the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to read.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<any>} The deserialized value, or null on failure.
     */
    static get(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<any>;
    /**
     * Serializes and stores a value at the given key, optionally setting a TTL.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to write.
     * @param {any} value - Value to store.
     * @param {number} ttl - Optional time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number | "OK">} The Redis set response, or 0 on failure.
     */
    static set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string, disconnectAfter?: boolean): Promise<number | "OK">;
    /**
     * Deletes the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to delete.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} Number of keys deleted, or 0 on failure.
     */
    static del(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Checks whether the given key exists.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to check.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<boolean>} True when the key exists, false otherwise or on failure.
     */
    static exists(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<boolean>;
    /**
     * Increments the integer stored at the given key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static incr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Decrements the integer stored at the given key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static decr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Increments the integer stored at the given key by the given amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {number} increment - Amount to add.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static incrBy(key: Bun.RedisClient.KeyLike, increment: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Decrements the integer stored at the given key by the given amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {number} decrement - Amount to subtract.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static decrBy(key: Bun.RedisClient.KeyLike, decrement: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Returns the remaining time-to-live in seconds for the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to inspect.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The remaining TTL, or 0 on failure.
     */
    static ttl(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Sets a time-to-live in seconds on the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to expire.
     * @param {number} value - Time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} True when the expiry is set, or 0 on failure.
     */
    static expire(key: Bun.RedisClient.KeyLike, value: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Publishes a serialized message to a channel.
     *
     * @param {string} channel - Channel to publish to.
     * @param {any} message - Message to publish.
     * @param {string} connection - Optional connection name.
     * @returns {Promise<number>} Number of clients that received the message, or 0 on failure.
     */
    static publish(channel: string, message: any, connection?: string): Promise<number>;
    /**
     * Subscribes a listener to a channel and returns a handle with an unsubscribe function.
     *
     * @param {string} channel - Channel to subscribe to.
     * @param {Bun.RedisClient.StringPubSubListener} listener - Callback invoked with deserialized messages.
     * @param {string} connection - Optional connection name.
     * @returns {Promise<RedisSubscribe>} The subscription client and its unsubscribe function.
     */
    static subscribe(channel: string, listener: Bun.RedisClient.StringPubSubListener, connection?: string): Promise<RedisSubscribe>;
    /**
     * Runs multiple commands through a pipelined interface and returns the deserialized results.
     *
     * @param {Function} fn - Callback that enqueues commands on the pipeline.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<Array<any>>} Array of deserialized results in command order.
     */
    static pipeline(fn: (pipe: RedisPipeline) => void, connection?: string, disconnectAfter?: boolean): Promise<any[]>;
    /**
     * Registers a listener for a lifecycle event.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to listen for.
     * @param {Function} listener - Callback invoked on the event.
     */
    static on(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
    /**
     * Removes a listener for a lifecycle event.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to stop listening for.
     * @param {Function} listener - Callback to remove.
     */
    static off(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
    /** Lazily loaded Redis config, read from disk exactly once. */
    private static cachedConfig;
    /**
     * Returns the Redis config, loading it from disk once and reusing the result.
     *
     * @returns {Record<string, any>} The resolved Redis config.
     */
    private static get config();
    /**
     * Builds a Redis connection URL from the given configuration.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {string} The constructed Redis URL.
     */
    private static buildUrl;
    /**
     * Creates a Redis client for the given connection, wiring up connect and close handlers.
     *
     * @param {string} name - Connection name used for logging and events.
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {Bun.RedisClient} The new Redis client.
     */
    private static createClient;
    /**
     * Builds Redis client options from the given configuration.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {Bun.RedisOptions} The client options.
     */
    private static getOptions;
    /**
     * Resolves connection configuration for a connection name.
     *
     * @param {string} name - Optional connection name.
     * @returns {RedisConfig} The resolved connection configuration.
     * @throws {RedisException} When the requested connection is not found.
     */
    private static getConfig;
    /**
     * Resolves the connection name, defaulting to the configured default.
     *
     * @param {string} name - Optional connection name.
     * @returns {string} The resolved connection name.
     */
    private static connectionName;
    /**
     * Returns the client for a connection name, creating it lazily if needed.
     *
     * @param {string} name - Optional connection name.
     * @returns {Bun.RedisClient} The Redis client for the connection.
     */
    private static getClient;
    /**
     * Serializes a value for storage.
     *
     * @param {any} value - Value to serialize.
     * @returns {string} The serialized string representation.
     */
    private static serialize;
    /**
     * Deserializes a stored string back into its original value.
     *
     * @param {string} value - Stored string to deserialize.
     * @returns {any} The parsed value, or null when empty.
     */
    private static deserialize;
    /** Registers process exit and signal handlers once to disconnect all clients on shutdown. */
    private static ensureExitHooks;
}
