import type { RedisConfig, RedisPipeline, RedisSubscribe } from "../types/redis";
/** Static facade forwarding Redis operations to the underlying RedisBuilder. */
export default class Redis {
    /**
     * Creates a client from the given config and returns bound command wrappers.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @param {string} name - Optional connection name.
     */
    static setClient(cfg: RedisConfig, name?: string): Record<string, (...args: Array<any>) => {}>;
    /**
     * Returns command wrappers bound to an existing connection.
     *
     * @param {string} name - Connection name.
     */
    static connection(name: string): Record<string, (...args: Array<any>) => {}>;
    /**
     * Connects the client for a connection.
     *
     * @param {string} name - Optional connection name.
     */
    static connect(name?: string): Promise<Bun.RedisClient>;
    /**
     * Disconnects a connection or all connections.
     *
     * @param {string} name - Optional connection name.
     */
    static disconnect(name?: string): Promise<void>;
    /**
     * Pings the server.
     *
     * @param {Bun.RedisClient.KeyLike} message - Optional message to send.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static ping(message?: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<string | boolean>;
    /**
     * Returns all keys matching a pattern.
     *
     * @param {string} pattern - Glob-style key pattern.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static keys(pattern: string, connection?: string, disconnectAfter?: boolean): Promise<Array<string>>;
    /**
     * Gets and deserializes a value.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to read.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static get(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<any>;
    /**
     * Serializes and stores a value with an optional TTL.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to write.
     * @param {any} value - Value to store.
     * @param {number} ttl - Optional time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string, disconnectAfter?: boolean): Promise<number | "OK">;
    /**
     * Deletes a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to delete.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static del(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Checks whether a key exists.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to check.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static exists(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<boolean>;
    /**
     * Increments a key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static incr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Decrements a key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static decr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Increments a key by an amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {number} increment - Amount to add.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static incrBy(key: Bun.RedisClient.KeyLike, increment: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Decrements a key by an amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {number} decrement - Amount to subtract.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static decrBy(key: Bun.RedisClient.KeyLike, decrement: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Returns the remaining time-to-live for a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to inspect.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static ttl(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Sets a time-to-live on a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to expire.
     * @param {number} value - Time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static expire(key: Bun.RedisClient.KeyLike, value: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    /**
     * Publishes a message to a channel.
     *
     * @param {string} channel - Channel to publish to.
     * @param {any} message - Message to publish.
     * @param {string} connection - Optional connection name.
     */
    static publish(channel: string, message: any, connection?: string): Promise<number>;
    /**
     * Subscribes a listener to a channel.
     *
     * @param {string} channel - Channel to subscribe to.
     * @param {Bun.RedisClient.StringPubSubListener} listener - Callback invoked with messages.
     * @param {string} connection - Optional connection name.
     */
    static subscribe(channel: string, listener: Bun.RedisClient.StringPubSubListener, connection?: string): Promise<RedisSubscribe>;
    /**
     * Runs multiple commands through a pipeline.
     *
     * @param {Function} fn - Callback that enqueues commands.
     * @param {string} connection - Optional connection name.
     */
    static pipeline(fn: (pipe: RedisPipeline) => void, connection?: string): Promise<any[]>;
    /**
     * Registers a lifecycle event listener.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to listen for.
     * @param {Function} listener - Callback invoked on the event.
     */
    static on(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
    /**
     * Removes a lifecycle event listener.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to stop listening for.
     * @param {Function} listener - Callback to remove.
     */
    static off(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
}
