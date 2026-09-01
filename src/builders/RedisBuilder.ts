import type {RedisConfig, RedisPipeline, RedisSubscribe} from "@/types/redis";
import App from "@bejibun/app";
import Logger from "@bejibun/logger";
import {defineValue, isEmpty, isNotEmpty} from "@bejibun/utils";
import {EventEmitter} from "events";
import fs from "fs";
import RedisConf from "@/config/redis";
import RedisException from "@/exceptions/RedisException";

/** Provides low-level Redis operations, connection management, pub/sub, and pipelines. */
export default class RedisBuilder {
    private static clients: Record<string, Bun.RedisClient> = {};
    private static emitter = new EventEmitter();

    /**
     * Creates and registers a client for the given configuration and returns bound command wrappers.
     *
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @param {string} name - Optional connection name; defaults to the configured default connection.
     * @returns {Record<string, (...args: Array<any>) => {}>} Map of command names to bound functions.
     */
    public static setClient(
        cfg: RedisConfig,
        name?: string
    ): Record<string, (...args: Array<any>) => {}> {
        const connectionName = defineValue(name, RedisBuilder.config.default);

        this.clients[connectionName] = this.createClient(connectionName, cfg);

        return {
            decr: (key: Bun.RedisClient.KeyLike) => this.decr(key, connectionName, false),
            decrBy: (key: Bun.RedisClient.KeyLike, decrement: number) =>
                this.decrBy(key, decrement, connectionName, false),
            del: (key: Bun.RedisClient.KeyLike) => this.del(key, connectionName, false),
            exists: (key: Bun.RedisClient.KeyLike) => this.exists(key, connectionName, false),
            expire: (key: Bun.RedisClient.KeyLike, value: number) =>
                this.expire(key, value, connectionName, false),
            get: (key: Bun.RedisClient.KeyLike) => this.get(key, connectionName, false),
            incr: (key: Bun.RedisClient.KeyLike) => this.incr(key, connectionName, false),
            incrBy: (key: Bun.RedisClient.KeyLike, increment: number) =>
                this.incrBy(key, increment, connectionName, false),
            keys: (pattern: string) => this.keys(pattern, connectionName, false),
            pipeline: (fn: (pipe: RedisPipeline) => void) =>
                this.pipeline(fn, connectionName, false),
            publish: (channel: string, message: any) =>
                this.publish(channel, message, connectionName),
            set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number) =>
                this.set(key, value, ttl, connectionName, false),
            subscribe: (channel: string, listener: Bun.RedisClient.StringPubSubListener) =>
                this.subscribe(channel, listener, connectionName),
            ttl: (key: Bun.RedisClient.KeyLike) => this.ttl(key, connectionName, false)
        };
    }

    /**
     * Returns command wrappers bound to an existing named connection.
     *
     * @param {string} name - Connection name.
     * @returns {Record<string, (...args: Array<any>) => {}>} Map of command names to bound functions.
     */
    public static connection(name: string): Record<string, (...args: Array<any>) => {}> {
        return {
            decr: (key: Bun.RedisClient.KeyLike) => this.decr(key, name),
            decrBy: (key: Bun.RedisClient.KeyLike, decrement: number) =>
                this.decrBy(key, decrement, name),
            del: (key: Bun.RedisClient.KeyLike) => this.del(key, name),
            exists: (key: Bun.RedisClient.KeyLike) => this.exists(key, name),
            expire: (key: Bun.RedisClient.KeyLike, value: number) => this.expire(key, value, name),
            get: (key: Bun.RedisClient.KeyLike) => this.get(key, name),
            incr: (key: Bun.RedisClient.KeyLike) => this.incr(key, name),
            incrBy: (key: Bun.RedisClient.KeyLike, increment: number) =>
                this.incrBy(key, increment, name),
            keys: (pattern: string) => this.keys(pattern, name),
            pipeline: (fn: (pipe: RedisPipeline) => void) => this.pipeline(fn, name),
            publish: (channel: string, message: any) => this.publish(channel, message, name),
            set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number) =>
                this.set(key, value, ttl, name),
            subscribe: (channel: string, listener: Bun.RedisClient.StringPubSubListener) =>
                this.subscribe(channel, listener, name),
            ttl: (key: Bun.RedisClient.KeyLike) => this.ttl(key, name)
        };
    }

    /**
     * Connects the client for the given connection and emits a connect event.
     *
     * @param {string} name - Optional connection name; defaults to the configured default.
     * @returns {Promise<Bun.RedisClient>} The connected Redis client.
     */
    public static async connect(name?: string): Promise<Bun.RedisClient> {
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
    public static async disconnect(name?: string): Promise<void> {
        if (isNotEmpty(name)) {
            const client = this.clients[name as string];

            try {
                await client?.close();
            } catch {
                // do nothing
            }

            delete this.clients[name as string];
        } else {
            for (const [_, client] of Object.entries(this.clients)) {
                try {
                    await client?.close();
                } catch {
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
    public static async ping(
        message?: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<string | boolean> {
        try {
            const response = await this.getClient(connection).ping(defineValue(message));

            if (disconnectAfter) await this.disconnect(connection);

            return response;
        } catch (error: any) {
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
    public static async keys(
        pattern: string,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<Array<string>> {
        try {
            const response = await this.getClient(connection).keys(pattern);

            if (disconnectAfter) await this.disconnect(connection);

            return response;
        } catch (error: any) {
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
    public static async get(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<any> {
        try {
            const response = await this.getClient(connection).get(key);

            if (disconnectAfter) await this.disconnect(connection);

            return this.deserialize(response);
        } catch (error: any) {
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
    public static async set(
        key: Bun.RedisClient.KeyLike,
        value: any,
        ttl?: number,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number | "OK"> {
        try {
            const client = this.getClient(connection);
            const serialized = this.serialize(value);

            const data = await client.set(key, serialized);

            if (isNotEmpty(ttl)) await client.expire(key, ttl as number);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async del(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).del(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async exists(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<boolean> {
        try {
            const data = await this.getClient(connection).exists(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async incr(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).incr(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async decr(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).decr(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async incrBy(
        key: Bun.RedisClient.KeyLike,
        increment: number,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).incrby(key, increment);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async decrBy(
        key: Bun.RedisClient.KeyLike,
        decrement: number,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).decrby(key, decrement);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async ttl(
        key: Bun.RedisClient.KeyLike,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).ttl(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async expire(
        key: Bun.RedisClient.KeyLike,
        value: number,
        connection?: string,
        disconnectAfter: boolean = false
    ): Promise<number> {
        try {
            const data = await this.getClient(connection).expire(key, value);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
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
    public static async publish(
        channel: string,
        message: any,
        connection?: string
    ): Promise<number> {
        try {
            const serialized = this.serialize(message);

            return await this.getClient(connection).publish(channel, serialized);
        } catch (error: any) {
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
    public static async subscribe(
        channel: string,
        listener: Bun.RedisClient.StringPubSubListener,
        connection?: string
    ): Promise<RedisSubscribe> {
        const client = this.getClient(connection);
        this.clients[channel] = client;

        try {
            await client.subscribe(channel, (message: string, channel: string) =>
                listener(this.deserialize(message), channel)
            );

            Logger.setContext("Redis").info(`Subscribed to "${channel}" channel.`);
        } catch (error: any) {
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
            } catch (error: any) {
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
    public static async pipeline(
        fn: (pipe: RedisPipeline) => void,
        connection?: string,
        disconnectAfter: boolean = false
    ) {
        const client = this.getClient(connection);
        const ops: Array<Promise<any>> = [];

        const pipe: RedisPipeline = {
            decr: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.decr(key));
            },
            decrBy: (key: Bun.RedisClient.KeyLike, decrement: number): void => {
                ops.push(client.decrby(key, decrement));
            },
            del: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.del(key));
            },
            exists: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.exists(key));
            },
            expire: (key: Bun.RedisClient.KeyLike, value: number): void => {
                ops.push(client.expire(key, value));
            },
            get: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.get(key));
            },
            incr: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.incr(key));
            },
            incrBy: (key: Bun.RedisClient.KeyLike, increment: number): void => {
                ops.push(client.incrby(key, increment));
            },
            keys: (pattern: string): void => {
                ops.push(client.keys(pattern));
            },
            set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number): void => {
                const serialized = this.serialize(value);

                const data = client.set(key, serialized);

                if (isNotEmpty(ttl)) ops.push(client.expire(key, ttl as number));

                ops.push(data);
            },
            ttl: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.ttl(key));
            }
        };

        fn(pipe);

        const results = await Promise.all(ops);

        if (disconnectAfter) await this.disconnect(connection);

        return results.map((result: any) => this.deserialize(result));
    }

    /**
     * Registers a listener for a lifecycle event.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to listen for.
     * @param {Function} listener - Callback invoked on the event.
     */
    public static on(
        event: "connect" | "disconnect" | "error",
        listener: (...args: Array<any>) => void
    ): void {
        this.emitter.on(event, listener);
    }

    /**
     * Removes a listener for a lifecycle event.
     *
     * @param {"connect" | "disconnect" | "error"} event - Event name to stop listening for.
     * @param {Function} listener - Callback to remove.
     */
    public static off(
        event: "connect" | "disconnect" | "error",
        listener: (...args: Array<any>) => void
    ): void {
        this.emitter.off(event, listener);
    }

    /** Lazily loaded Redis config, read from disk exactly once. */
    private static cachedConfig: Record<string, any>;

    /**
     * Returns the Redis config, loading it from disk once and reusing the result.
     *
     * @returns {Record<string, any>} The resolved Redis config.
     */
    private static get config(): Record<string, any> {
        if (RedisBuilder.cachedConfig) return RedisBuilder.cachedConfig;

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
    private static buildUrl(cfg: RedisConfig): string {
        const url = new URL(`redis://${cfg.host}:${cfg.port}`);

        if (isNotEmpty(cfg.password)) url.password = cfg.password as string;
        if (isNotEmpty(cfg.database)) url.pathname = `/${cfg.database}`;

        return url.toString();
    }

    /**
     * Creates a Redis client for the given connection, wiring up connect and close handlers.
     *
     * @param {string} name - Connection name used for logging and events.
     * @param {RedisConfig} cfg - Redis connection configuration.
     * @returns {Bun.RedisClient} The new Redis client.
     */
    private static createClient(name: string, cfg: RedisConfig): Bun.RedisClient {
        const url = this.buildUrl(cfg);
        const client = new Bun.RedisClient(url, this.getOptions(cfg));

        client.onconnect = () => {
            Logger.setContext("Redis").info(`Connected to "${name}" connection.`);
            this.emitter.emit("connect", name);
        };

        client.onclose = (error: Error) => {
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
    private static getOptions(cfg: RedisConfig): Bun.RedisOptions {
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
    private static getConfig(name?: string): RedisConfig {
        const connectionName = RedisBuilder.connectionName(name);
        const connection = defineValue(
            RedisBuilder.config.connections[connectionName],
            RedisBuilder.config.connections[defineValue(Bun.env.REDIS_CONNECTION, "local")]
        );

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
    private static connectionName(name?: string): string {
        return defineValue(name, RedisBuilder.config.default);
    }

    /**
     * Returns the client for a connection name, creating it lazily if needed.
     *
     * @param {string} name - Optional connection name.
     * @returns {Bun.RedisClient} The Redis client for the connection.
     */
    private static getClient(name?: string): Bun.RedisClient {
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
    private static serialize(value: any): string {
        if (isEmpty(value)) return "";
        if (typeof value === "object") return JSON.stringify(value);
        if (typeof value === "number" || typeof value === "boolean") return String(value);

        return value;
    }

    /**
     * Deserializes a stored string back into its original value.
     *
     * @param {string} value - Stored string to deserialize.
     * @returns {any} The parsed value, or null when empty.
     */
    private static deserialize(value?: string | null): any {
        if (isEmpty(value)) return null;

        try {
            return JSON.parse(value as string);
        } catch {
            return value;
        }
    }

    /** Registers process exit and signal handlers once to disconnect all clients on shutdown. */
    private static ensureExitHooks = (() => {
        let initialized = false;

        return (): void => {
            if (initialized) return;

            initialized = true;

            const handleExit = async (signal?: string): Promise<void> => {
                try {
                    await RedisBuilder.disconnect();

                    Logger.setContext("Redis").warn(
                        `Disconnected on "${defineValue(signal, "exit")}".`
                    );
                } catch (error: any) {
                    Logger.setContext("Redis").error("Error during disconnect.").trace(error);
                } finally {
                    process.exit(0);
                }
            };

            process.on("exit", async (): Promise<void> => {
                await handleExit();
            });
            process.on("SIGINT", async (): Promise<void> => {
                await handleExit("SIGINT");
            });
            process.on("SIGTERM", async (): Promise<void> => {
                await handleExit("SIGTERM");
            });
        };
    })();
}
