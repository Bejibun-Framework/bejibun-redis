import type {RedisConfig, RedisPipeline, RedisSubscribe} from "@/types/redis";
import RedisBuilder from "@/builders/RedisBuilder";

/** Static facade forwarding Redis operations to the underlying RedisBuilder. */
export default class Redis {
    /**
     * Creates a client from the given config and returns bound command wrappers.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @param {string} name - Optional connection name.
     */
    public static setClient(
        cfg: RedisConfig,
        name?: string
    ): Record<string, (...args: Array<any>) => {}> {
        return RedisBuilder.setClient(cfg, name);
    }

    /**
     * Returns command wrappers bound to an existing connection.
     *
     * @param {string} name - Connection name.
     */
    public static connection(name: string): Record<string, (...args: Array<any>) => {}> {
        return RedisBuilder.connection(name);
    }

    /**
     * Connects the client for a connection.
     *
     * @param {string} name - Optional connection name.
     */
    public static async connect(name?: string): Promise<Bun.RedisClient> {
        return RedisBuilder.connect(name);
    }

    /**
     * Disconnects a connection or all connections.
     *
     * @param {string} name - Optional connection name.
     */
    public static async disconnect(name?: string): Promise<void> {
        return RedisBuilder.disconnect(name);
    }

    /**
     * Pings the server.
     *
     * @param {Bun.RedisClient.KeyLike} message - Optional message to send.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async ping(
        message?: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<string | boolean> {
        return RedisBuilder.ping(message, connection, disconnectAfter);
    }

    /**
     * Returns all keys matching a pattern.
     *
     * @param {string} pattern - Glob-style key pattern.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async keys(
        pattern: string,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<Array<string>> {
        return RedisBuilder.keys(pattern, connection, disconnectAfter);
    }

    /**
     * Gets and deserializes a value.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to read.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async get(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<any> {
        return RedisBuilder.get(key, connection, disconnectAfter);
    }

    /**
     * Serializes and stores a value with an optional TTL.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to write.
     * @param {any} value - Value to store.
     * @param {number} ttl - Optional time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async set(
        key: Bun.RedisClient.KeyLike,
        value: any,
        ttl?: number,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number | "OK"> {
        return RedisBuilder.set(key, value, ttl, connection, disconnectAfter);
    }

    /**
     * Deletes a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to delete.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async del(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.del(key, connection, disconnectAfter);
    }

    /**
     * Checks whether a key exists.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to check.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async exists(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<boolean> {
        return RedisBuilder.exists(key, connection, disconnectAfter);
    }

    /**
     * Increments a key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async incr(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.incr(key, connection, disconnectAfter);
    }

    /**
     * Decrements a key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async decr(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.decr(key, connection, disconnectAfter);
    }

    /**
     * Increments a key by an amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {number} increment - Amount to add.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async incrBy(
        key: Bun.RedisClient.KeyLike,
        increment: number,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.incrBy(key, increment, connection, disconnectAfter);
    }

    /**
     * Decrements a key by an amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {number} decrement - Amount to subtract.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async decrBy(
        key: Bun.RedisClient.KeyLike,
        decrement: number,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.decrBy(key, decrement, connection, disconnectAfter);
    }

    /**
     * Returns the remaining time-to-live for a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to inspect.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async ttl(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.ttl(key, connection, disconnectAfter);
    }

    /**
     * Sets a time-to-live on a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to expire.
     * @param {number} value - Time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    public static async expire(
        key: Bun.RedisClient.KeyLike,
        value: number,
        connection?: string,
        disconnectAfter?: boolean
    ): Promise<number> {
        return RedisBuilder.expire(key, value, connection, disconnectAfter);
    }

    /**
     * Publishes a message to a channel.
     *
     * @param {string} channel - Channel to publish to.
     * @param {any} message - Message to publish.
     * @param {string} connection - Optional connection name.
     */
    public static async publish(
        channel: string,
        message: any,
        connection?: string
    ): Promise<number> {
        return RedisBuilder.publish(channel, message, connection);
    }

    /**
     * Subscribes a listener to a channel.
     *
     * @param {string} channel - Channel to subscribe to.
     * @param {Bun.RedisClient.StringPubSubListener} listener - Callback invoked with messages.
     * @param {string} connection - Optional connection name.
     */
    public static async subscribe(
        channel: string,
        listener: Bun.RedisClient.StringPubSubListener,
        connection?: string
    ): Promise<RedisSubscribe> {
        return RedisBuilder.subscribe(channel, listener, connection);
    }

    /**
     * Runs multiple commands through a pipeline.
     *
     * @param {Function} fn - Callback that enqueues commands.
     * @param {string} connection - Optional connection name.
     */
    public static async pipeline(fn: (pipe: RedisPipeline) => void, connection?: string) {
        return RedisBuilder.pipeline(fn, connection);
    }

    /**
     * Registers a lifecycle event listener.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to listen for.
     * @param {Function} listener - Callback invoked on the event.
     */
    public static on(
        event: "connect" | "disconnect" | "error",
        listener: (...args: Array<any>) => void
    ): void {
        return RedisBuilder.on(event, listener);
    }

    /**
     * Removes a lifecycle event listener.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to stop listening for.
     * @param {Function} listener - Callback to remove.
     */
    public static off(
        event: "connect" | "disconnect" | "error",
        listener: (...args: Array<any>) => void
    ): void {
        return RedisBuilder.off(event, listener);
    }
}
