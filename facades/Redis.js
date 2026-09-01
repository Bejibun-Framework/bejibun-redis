import RedisBuilder from "../builders/RedisBuilder";
/** Static facade forwarding Redis operations to the underlying RedisBuilder. */
export default class Redis {
    /**
     * Creates a client from the given config and returns bound command wrappers.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @param {string} name - Optional connection name.
     */
    static setClient(cfg, name) {
        return RedisBuilder.setClient(cfg, name);
    }
    /**
     * Returns command wrappers bound to an existing connection.
     *
     * @param {string} name - Connection name.
     */
    static connection(name) {
        return RedisBuilder.connection(name);
    }
    /**
     * Connects the client for a connection.
     *
     * @param {string} name - Optional connection name.
     */
    static async connect(name) {
        return RedisBuilder.connect(name);
    }
    /**
     * Disconnects a connection or all connections.
     *
     * @param {string} name - Optional connection name.
     */
    static async disconnect(name) {
        return RedisBuilder.disconnect(name);
    }
    /**
     * Pings the server.
     *
     * @param {Bun.RedisClient.KeyLike} message - Optional message to send.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async ping(message, connection, disconnectAfter) {
        return RedisBuilder.ping(message, connection, disconnectAfter);
    }
    /**
     * Returns all keys matching a pattern.
     *
     * @param {string} pattern - Glob-style key pattern.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async keys(pattern, connection, disconnectAfter) {
        return RedisBuilder.keys(pattern, connection, disconnectAfter);
    }
    /**
     * Gets and deserializes a value.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to read.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async get(key, connection, disconnectAfter) {
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
    static async set(key, value, ttl, connection, disconnectAfter) {
        return RedisBuilder.set(key, value, ttl, connection, disconnectAfter);
    }
    /**
     * Deletes a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to delete.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async del(key, connection, disconnectAfter) {
        return RedisBuilder.del(key, connection, disconnectAfter);
    }
    /**
     * Checks whether a key exists.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to check.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async exists(key, connection, disconnectAfter) {
        return RedisBuilder.exists(key, connection, disconnectAfter);
    }
    /**
     * Increments a key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async incr(key, connection, disconnectAfter) {
        return RedisBuilder.incr(key, connection, disconnectAfter);
    }
    /**
     * Decrements a key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async decr(key, connection, disconnectAfter) {
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
    static async incrBy(key, increment, connection, disconnectAfter) {
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
    static async decrBy(key, decrement, connection, disconnectAfter) {
        return RedisBuilder.decrBy(key, decrement, connection, disconnectAfter);
    }
    /**
     * Returns the remaining time-to-live for a key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to inspect.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     */
    static async ttl(key, connection, disconnectAfter) {
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
    static async expire(key, value, connection, disconnectAfter) {
        return RedisBuilder.expire(key, value, connection, disconnectAfter);
    }
    /**
     * Publishes a message to a channel.
     *
     * @param {string} channel - Channel to publish to.
     * @param {any} message - Message to publish.
     * @param {string} connection - Optional connection name.
     */
    static async publish(channel, message, connection) {
        return RedisBuilder.publish(channel, message, connection);
    }
    /**
     * Subscribes a listener to a channel.
     *
     * @param {string} channel - Channel to subscribe to.
     * @param {Bun.RedisClient.StringPubSubListener} listener - Callback invoked with messages.
     * @param {string} connection - Optional connection name.
     */
    static async subscribe(channel, listener, connection) {
        return RedisBuilder.subscribe(channel, listener, connection);
    }
    /**
     * Runs multiple commands through a pipeline.
     *
     * @param {Function} fn - Callback that enqueues commands.
     * @param {string} connection - Optional connection name.
     */
    static async pipeline(fn, connection) {
        return RedisBuilder.pipeline(fn, connection);
    }
    /**
     * Registers a lifecycle event listener.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to listen for.
     * @param {Function} listener - Callback invoked on the event.
     */
    static on(event, listener) {
        return RedisBuilder.on(event, listener);
    }
    /**
     * Removes a lifecycle event listener.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to stop listening for.
     * @param {Function} listener - Callback to remove.
     */
    static off(event, listener) {
        return RedisBuilder.off(event, listener);
    }
}
