import App from "@bejibun/app";
import Logger from "@bejibun/logger";
import { defineValue, isEmpty, isNotEmpty } from "@bejibun/utils";
import { EventEmitter } from "events";
import fs from "fs";
import RedisConf from "../config/redis";
import RedisException from "../exceptions/RedisException";
/** Provides low-level Redis operations, connection management, pub/sub, and pipelines. */
export default class RedisBuilder {
    static clients = {};
    static emitter = new EventEmitter();
    /**
     * Creates and registers a client for the given configuration and returns bound command wrappers.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @param {string} name - Optional connection name; defaults to the configured default connection.
     * @returns {Record<string, (...args: Array<any>) => {}>} Map of command names to bound functions.
     */
    static setClient(cfg, name) {
        const connectionName = defineValue(name, RedisBuilder.config.default);
        this.clients[connectionName] = this.createClient(connectionName, cfg);
        return {
            decr: (key) => this.decr(key, connectionName, false),
            decrBy: (key, decrement) => this.decrBy(key, decrement, connectionName, false),
            del: (key) => this.del(key, connectionName, false),
            exists: (key) => this.exists(key, connectionName, false),
            expire: (key, value) => this.expire(key, value, connectionName, false),
            get: (key) => this.get(key, connectionName, false),
            incr: (key) => this.incr(key, connectionName, false),
            incrBy: (key, increment) => this.incrBy(key, increment, connectionName, false),
            keys: (pattern) => this.keys(pattern, connectionName, false),
            pipeline: (fn) => this.pipeline(fn, connectionName, false),
            publish: (channel, message) => this.publish(channel, message, connectionName),
            set: (key, value, ttl) => this.set(key, value, ttl, connectionName, false),
            subscribe: (channel, listener) => this.subscribe(channel, listener, connectionName),
            ttl: (key) => this.ttl(key, connectionName, false)
        };
    }
    /**
     * Returns command wrappers bound to an existing named connection.
     *
     * @param {string} name - Connection name.
     * @returns {Record<string, (...args: Array<any>) => {}>} Map of command names to bound functions.
     */
    static connection(name) {
        return {
            decr: (key) => this.decr(key, name),
            decrBy: (key, decrement) => this.decrBy(key, decrement, name),
            del: (key) => this.del(key, name),
            exists: (key) => this.exists(key, name),
            expire: (key, value) => this.expire(key, value, name),
            get: (key) => this.get(key, name),
            incr: (key) => this.incr(key, name),
            incrBy: (key, increment) => this.incrBy(key, increment, name),
            keys: (pattern) => this.keys(pattern, name),
            pipeline: (fn) => this.pipeline(fn, name),
            publish: (channel, message) => this.publish(channel, message, name),
            set: (key, value, ttl) => this.set(key, value, ttl, name),
            subscribe: (channel, listener) => this.subscribe(channel, listener, name),
            ttl: (key) => this.ttl(key, name)
        };
    }
    /**
     * Connects the client for the given connection and emits a connect event.
     *
     * @param {string} name - Optional connection name; defaults to the configured default.
     * @returns {Promise<Bun.RedisClient>} The connected Redis client.
     */
    static async connect(name) {
        const client = this.getClient(name);
        await client.connect();
        const connectionName = RedisBuilder.connectionName(name);
        Logger.setContext("Redis").info(`Connected manually to "${connectionName}" connection.`);
        this.emitter.emit("connect", connectionName);
        return client;
    }
    /**
     * Closes and unregisters a single named connection, or all connections when no name is given.
     *
     * @param {string} name - Optional connection name.
     */
    static async disconnect(name) {
        if (isNotEmpty(name)) {
            const client = this.clients[name];
            try {
                await client?.close();
            }
            catch {
                // do nothing
            }
            delete this.clients[name];
        }
        else {
            for (const [_, client] of Object.entries(this.clients)) {
                try {
                    await client?.close();
                }
                catch {
                    // do nothing
                }
            }
            this.clients = {};
        }
    }
    /**
     * Pings the server, returning the response or false on failure.
     *
     * @param {Bun.RedisClient.KeyLike} message - Optional message to send with the ping.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<string | boolean>} The ping response, or false when the ping fails.
     */
    static async ping(message, connection, disconnectAfter = false) {
        try {
            const response = await this.getClient(connection).ping(defineValue(message));
            if (disconnectAfter)
                await this.disconnect(connection);
            return response;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to ping value.").trace(error);
            return false;
        }
    }
    /**
     * Returns all keys matching the given pattern.
     *
     * @param {string} pattern - Glob-style key pattern.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<Array<string>>} Array of matching keys, or an empty array on failure.
     */
    static async keys(pattern, connection, disconnectAfter = false) {
        try {
            const response = await this.getClient(connection).keys(pattern);
            if (disconnectAfter)
                await this.disconnect(connection);
            return response;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to get keys.").trace(error);
            return [];
        }
    }
    /**
     * Gets and deserializes the value stored at the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to read.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<any>} The deserialized value, or null on failure.
     */
    static async get(key, connection, disconnectAfter = false) {
        try {
            const response = await this.getClient(connection).get(key);
            if (disconnectAfter)
                await this.disconnect(connection);
            return this.deserialize(response);
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to get value.").trace(error);
            return null;
        }
    }
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
    static async set(key, value, ttl, connection, disconnectAfter = false) {
        try {
            const client = this.getClient(connection);
            const serialized = this.serialize(value);
            const data = await client.set(key, serialized);
            if (isNotEmpty(ttl))
                await client.expire(key, ttl);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to set value.").trace(error);
            return 0;
        }
    }
    /**
     * Deletes the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to delete.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} Number of keys deleted, or 0 on failure.
     */
    static async del(key, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).del(key);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to delete key.").trace(error);
            return 0;
        }
    }
    /**
     * Checks whether the given key exists.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to check.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<boolean>} True when the key exists, false otherwise or on failure.
     */
    static async exists(key, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).exists(key);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to check key.").trace(error);
            return false;
        }
    }
    /**
     * Increments the integer stored at the given key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static async incr(key, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).incr(key);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to increase key.").trace(error);
            return 0;
        }
    }
    /**
     * Decrements the integer stored at the given key by one.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static async decr(key, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).decr(key);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to decrease key.").trace(error);
            return 0;
        }
    }
    /**
     * Increments the integer stored at the given key by the given amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to increment.
     * @param {number} increment - Amount to add.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static async incrBy(key, increment, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).incrby(key, increment);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to increase key.").trace(error);
            return 0;
        }
    }
    /**
     * Decrements the integer stored at the given key by the given amount.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to decrement.
     * @param {number} decrement - Amount to subtract.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The new value, or 0 on failure.
     */
    static async decrBy(key, decrement, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).decrby(key, decrement);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to decrease key.").trace(error);
            return 0;
        }
    }
    /**
     * Returns the remaining time-to-live in seconds for the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to inspect.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} The remaining TTL, or 0 on failure.
     */
    static async ttl(key, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).ttl(key);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to fetch ttl.").trace(error);
            return 0;
        }
    }
    /**
     * Sets a time-to-live in seconds on the given key.
     *
     * @param {Bun.RedisClient.KeyLike} key - Key to expire.
     * @param {number} value - Time-to-live in seconds.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<number>} True when the expiry is set, or 0 on failure.
     */
    static async expire(key, value, connection, disconnectAfter = false) {
        try {
            const data = await this.getClient(connection).expire(key, value);
            if (disconnectAfter)
                await this.disconnect(connection);
            return data;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to set expire.").trace(error);
            return 0;
        }
    }
    /**
     * Publishes a serialized message to a channel.
     *
     * @param {string} channel - Channel to publish to.
     * @param {any} message - Message to publish.
     * @param {string} connection - Optional connection name.
     * @returns {Promise<number>} Number of clients that received the message, or 0 on failure.
     */
    static async publish(channel, message, connection) {
        try {
            const serialized = this.serialize(message);
            return await this.getClient(connection).publish(channel, serialized);
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to publish channel.").trace(error);
            return 0;
        }
    }
    /**
     * Subscribes a listener to a channel and returns a handle with an unsubscribe function.
     *
     * @param {string} channel - Channel to subscribe to.
     * @param {Bun.RedisClient.StringPubSubListener} listener - Callback invoked with deserialized messages.
     * @param {string} connection - Optional connection name.
     * @returns {Promise<RedisSubscribe>} The subscription client and its unsubscribe function.
     */
    static async subscribe(channel, listener, connection) {
        const client = this.getClient(connection);
        this.clients[channel] = client;
        try {
            await client.subscribe(channel, (message, channel) => listener(this.deserialize(message), channel));
            Logger.setContext("Redis").info(`Subscribed to "${channel}" channel.`);
        }
        catch (error) {
            Logger.setContext("Redis")
                .error(`Failed to subscribe "${channel}" channel.`)
                .trace(error);
        }
        const unsubscribe = async () => {
            try {
                await client.unsubscribe(channel);
                await client.close();
                Logger.setContext("Redis").warn(`Unsubscribed from "${channel}" channel.`);
                return true;
            }
            catch (error) {
                Logger.setContext("Redis")
                    .error(`Failed to unsubscribe from "${channel}" channel.`)
                    .trace(error);
                return false;
            }
        };
        return {
            client,
            unsubscribe: unsubscribe
        };
    }
    /**
     * Runs multiple commands through a pipelined interface and returns the deserialized results.
     *
     * @param {Function} fn - Callback that enqueues commands on the pipeline.
     * @param {string} connection - Optional connection name.
     * @param {boolean} disconnectAfter - Whether to disconnect after the operation.
     * @returns {Promise<Array<any>>} Array of deserialized results in command order.
     */
    static async pipeline(fn, connection, disconnectAfter = false) {
        const client = this.getClient(connection);
        const ops = [];
        const pipe = {
            decr: (key) => {
                ops.push(client.decr(key));
            },
            decrBy: (key, decrement) => {
                ops.push(client.decrby(key, decrement));
            },
            del: (key) => {
                ops.push(client.del(key));
            },
            exists: (key) => {
                ops.push(client.exists(key));
            },
            expire: (key, value) => {
                ops.push(client.expire(key, value));
            },
            get: (key) => {
                ops.push(client.get(key));
            },
            incr: (key) => {
                ops.push(client.incr(key));
            },
            incrBy: (key, increment) => {
                ops.push(client.incrby(key, increment));
            },
            keys: (pattern) => {
                ops.push(client.keys(pattern));
            },
            set: (key, value, ttl) => {
                const serialized = this.serialize(value);
                const data = client.set(key, serialized);
                if (isNotEmpty(ttl))
                    ops.push(client.expire(key, ttl));
                ops.push(data);
            },
            ttl: (key) => {
                ops.push(client.ttl(key));
            }
        };
        fn(pipe);
        const results = await Promise.all(ops);
        if (disconnectAfter)
            await this.disconnect(connection);
        return results.map((result) => this.deserialize(result));
    }
    /**
     * Registers a listener for a lifecycle event.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to listen for.
     * @param {Function} listener - Callback invoked on the event.
     */
    static on(event, listener) {
        this.emitter.on(event, listener);
    }
    /**
     * Removes a listener for a lifecycle event.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to stop listening for.
     * @param {Function} listener - Callback to remove.
     */
    static off(event, listener) {
        this.emitter.off(event, listener);
    }
    /** Lazily loaded Redis config, read from disk exactly once. */
    static cachedConfig;
    /**
     * Returns the Redis config, loading it from disk once and reusing the result.
     *
     * @returns {Record<string, any>} The resolved Redis config.
     */
    static get config() {
        if (RedisBuilder.cachedConfig)
            return RedisBuilder.cachedConfig;
        const configPath = App.Path.configPath("redis.ts");
        RedisBuilder.cachedConfig = fs.existsSync(configPath)
            ? require(configPath).default
            : RedisConf;
        return RedisBuilder.cachedConfig;
    }
    /**
     * Builds a Redis connection URL from the given configuration.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {string} The constructed Redis URL.
     */
    static buildUrl(cfg) {
        const url = new URL(`redis://${cfg.host}:${cfg.port}`);
        if (isNotEmpty(cfg.password))
            url.password = cfg.password;
        if (isNotEmpty(cfg.database))
            url.pathname = `/${cfg.database}`;
        return url.toString();
    }
    /**
     * Creates a Redis client for the given connection, wiring up connect and close handlers.
     *
     * @param {string} name - Connection name used for logging and events.
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {Bun.RedisClient} The new Redis client.
     */
    static createClient(name, cfg) {
        const url = this.buildUrl(cfg);
        const client = new Bun.RedisClient(url, this.getOptions(cfg));
        client.onconnect = () => {
            Logger.setContext("Redis").info(`Connected to "${name}" connection.`);
            this.emitter.emit("connect", name);
        };
        client.onclose = (error) => {
            Logger.setContext("Redis").warn(`Disconnected from "${name}" connection.`).trace(error);
            this.emitter.emit("disconnect", name, error);
        };
        return client;
    }
    /**
     * Builds Redis client options from the given configuration.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {Bun.RedisOptions} The client options.
     */
    static getOptions(cfg) {
        return {
            autoReconnect: true,
            maxRetries: cfg.maxRetries
        };
    }
    /**
     * Resolves connection configuration for a connection name.
     *
     * @param {string} name - Optional connection name.
     * @returns {RedisConfig} The resolved connection configuration.
     * @throws {RedisException} When the requested connection is not found.
     */
    static getConfig(name) {
        const connectionName = RedisBuilder.connectionName(name);
        const connection = defineValue(RedisBuilder.config.connections[connectionName], RedisBuilder.config.connections[defineValue(Bun.env.REDIS_CONNECTION, "local")]);
        if (isEmpty(connection))
            throw new RedisException(`Connection "${connectionName}" not found.`);
        return connection;
    }
    /**
     * Resolves the connection name, defaulting to the configured default.
     *
     * @param {string} name - Optional connection name.
     * @returns {string} The resolved connection name.
     */
    static connectionName(name) {
        return defineValue(name, RedisBuilder.config.default);
    }
    /**
     * Returns the client for a connection name, creating it lazily if needed.
     *
     * @param {string} name - Optional connection name.
     * @returns {Bun.RedisClient} The Redis client for the connection.
     */
    static getClient(name) {
        const connectionName = RedisBuilder.connectionName(name);
        RedisBuilder.ensureExitHooks();
        if (isEmpty(RedisBuilder.clients[connectionName])) {
            const cfg = RedisBuilder.getConfig(connectionName);
            RedisBuilder.clients[connectionName] = RedisBuilder.createClient(connectionName, cfg);
        }
        return RedisBuilder.clients[connectionName];
    }
    /**
     * Serializes a value for storage.
     *
     * @param {any} value - Value to serialize.
     * @returns {string} The serialized string representation.
     */
    static serialize(value) {
        if (isEmpty(value))
            return "";
        if (typeof value === "object")
            return JSON.stringify(value);
        if (typeof value === "number" || typeof value === "boolean")
            return String(value);
        return value;
    }
    /**
     * Deserializes a stored string back into its original value.
     *
     * @param {string} value - Stored string to deserialize.
     * @returns {any} The parsed value, or null when empty.
     */
    static deserialize(value) {
        if (isEmpty(value))
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    /** Registers process exit and signal handlers once to disconnect all clients on shutdown. */
    static ensureExitHooks = (() => {
        let initialized = false;
        return () => {
            if (initialized)
                return;
            initialized = true;
            const handleExit = async (signal) => {
                try {
                    await RedisBuilder.disconnect();
                    Logger.setContext("Redis").warn(`Disconnected on "${defineValue(signal, "exit")}".`);
                }
                catch (error) {
                    Logger.setContext("Redis").error("Error during disconnect.").trace(error);
                }
                finally {
                    process.exit(0);
                }
            };
            process.on("exit", async () => {
                await handleExit();
            });
            process.on("SIGINT", async () => {
                await handleExit("SIGINT");
            });
            process.on("SIGTERM", async () => {
                await handleExit("SIGTERM");
            });
        };
    })();
}
