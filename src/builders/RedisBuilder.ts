import type {RedisConfig, RedisPipeline, RedisSubscribe} from "@/types/redis";
import App from "@bejibun/app";
import Logger from "@bejibun/logger";
import {defineValue, isEmpty, isNotEmpty} from "@bejibun/utils";
import Str from "@bejibun/utils/facades/Str";
import {EventEmitter} from "events";
import fs from "fs";
import RedisConf from "@/config/redis";
import RedisException from "@/exceptions/RedisException";

export default class RedisBuilder {
    private static clients: Record<string, Bun.RedisClient> = {};
    private static emitter = new EventEmitter();

    public static setClient(cfg: RedisConfig, name?: string): Record<string, Function> {
        const connectionName = defineValue(name, Str.random());

        this.clients[connectionName] = this.createClient(connectionName, cfg);

        return {
            del: (key: Bun.RedisClient.KeyLike) => this.del(key, connectionName, isNotEmpty(name)),
            expire: (key: Bun.RedisClient.KeyLike, value: number) => this.expire(key, value, connectionName, isNotEmpty(name)),
            get: (key: Bun.RedisClient.KeyLike) => this.get(key, connectionName, isNotEmpty(name)),
            keys: (pattern: string) => this.keys(pattern, connectionName, isNotEmpty(name)),
            pipeline: (fn: (pipe: RedisPipeline) => void) => this.pipeline(fn, connectionName, isNotEmpty(name)),
            publish: (channel: string, message: any) => this.publish(channel, message, connectionName),
            set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number) => this.set(key, value, ttl, connectionName, isNotEmpty(name)),
            subscribe: (channel: string, listener: Bun.RedisClient.StringPubSubListener) => this.subscribe(channel, listener, connectionName),
            ttl: (key: Bun.RedisClient.KeyLike) => this.ttl(key, connectionName, isNotEmpty(name))
        };
    }

    public static connection(name: string): Record<string, Function> {
        return {
            del: (key: Bun.RedisClient.KeyLike) => this.del(key, name),
            expire: (key: Bun.RedisClient.KeyLike, value: number) => this.expire(key, value, name),
            get: (key: Bun.RedisClient.KeyLike) => this.get(key, name),
            keys: (pattern: string) => this.keys(pattern, name),
            pipeline: (fn: (pipe: RedisPipeline) => void) => this.pipeline(fn, name),
            publish: (channel: string, message: any) => this.publish(channel, message, name),
            set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number) => this.set(key, value, ttl, name),
            subscribe: (channel: string, listener: Bun.RedisClient.StringPubSubListener) => this.subscribe(channel, listener, name),
            ttl: (key: Bun.RedisClient.KeyLike) => this.ttl(key, name)
        };
    }

    public static async connect(name?: string): Promise<Bun.RedisClient> {
        const client = this.getClient(name);
        await client.connect();

        Logger.setContext("Redis").info(`Connected manually to "${defineValue(name, "default")}" connection.`);
        this.emitter.emit("connect", defineValue(name, "default"));

        return client;
    }

    public static async disconnect(name?: string): Promise<void> {
        if (isNotEmpty(name)) {
            const client = this.clients[name as string];

            await client?.close();
            delete this.clients[name as string];
        } else {
            for (const [_, client] of Object.entries(this.clients)) {
                await client?.close();
            }

            this.clients = {};
        }
    }

    public static async keys(pattern: string, connection?: string, disconnectAfter: boolean = true): Promise<Array<string>> {
        try {
            const response = await this.getClient(connection).keys(pattern);

            if (disconnectAfter) await this.disconnect(connection);

            return response;
        } catch (error: any) {
            Logger.setContext("Redis").error("Failed to get value.").trace(error);

            return [];
        }
    }

    public static async get(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter: boolean = true): Promise<any> {
        try {
            const response = await this.getClient(connection).get(key);

            if (disconnectAfter) await this.disconnect(connection);

            return this.deserialize(response);
        } catch (error: any) {
            Logger.setContext("Redis").error("Failed to get value.").trace(error);

            return null;
        }
    }

    public static async set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string, disconnectAfter: boolean = true): Promise<number | "OK"> {
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

    public static async del(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter: boolean = true): Promise<number> {
        try {
            const data = await this.getClient(connection).del(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
            Logger.setContext("Redis").error("Failed to delete key.").trace(error);

            return 0;
        }
    }

    public static async ttl(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter: boolean = true): Promise<number> {
        try {
            const data = await this.getClient(connection).ttl(key);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
            Logger.setContext("Redis").error("Failed to fetch ttl.").trace(error);

            return 0;
        }
    }

    public static async expire(key: Bun.RedisClient.KeyLike, value: number, connection?: string, disconnectAfter: boolean = true): Promise<number> {
        try {
            const data = await this.getClient(connection).expire(key, value);

            if (disconnectAfter) await this.disconnect(connection);

            return data;
        } catch (error: any) {
            Logger.setContext("Redis").error("Failed to set expire.").trace(error);

            return 0;
        }
    }

    public static async publish(channel: string, message: any, connection?: string): Promise<number> {
        try {
            const serialized = this.serialize(message);

            return await this.getClient(connection).publish(channel, serialized);
        } catch (error: any) {
            Logger.setContext("Redis").error("Failed to publish channel.").trace(error);

            return 0;
        }
    }

    public static async subscribe(channel: string, listener: Bun.RedisClient.StringPubSubListener, connection?: string): Promise<RedisSubscribe> {
        const client = this.getClient(connection);
        this.clients[channel] = client;

        try {
            await client.subscribe(channel, (message: string, channel: string) => listener(this.deserialize(message), channel));

            Logger.setContext("Redis").info(`Subscribed to "${channel}" channel.`);
        } catch (error: any) {
            Logger.setContext("Redis").error(`Failed to subscribe "${channel}" channel.`).trace(error);
        }

        const unsubscribe = async () => {
            try {
                await client.unsubscribe(channel);
                await client.close();

                Logger.setContext("Redis").warn(`Unsubscribed from "${channel}" channel.`);

                return true;
            } catch (error: any) {
                Logger.setContext("Redis").error(`Failed to unsubscribe from "${channel}" channel.`).trace(error);

                return false;
            }
        };

        return {
            client,
            unsubscribe: unsubscribe
        };
    }

    public static async pipeline(fn: (pipe: RedisPipeline) => void, connection?: string, disconnectAfter: boolean = true) {
        const client = this.getClient(connection);
        const ops: Array<Promise<any>> = [];

        const pipe: RedisPipeline = {
            del: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.del(key));
            },
            get: (key: Bun.RedisClient.KeyLike): void => {
                ops.push(client.get(key));
            },
            set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number): void => {
                const serialized = this.serialize(value);

                const data = client.set(key, serialized);

                if (isNotEmpty(ttl)) ops.push(client.expire(key, ttl as number));

                ops.push(data);
            }
        };

        fn(pipe);

        const results = await Promise.all(ops);

        if (disconnectAfter) await this.disconnect(connection);

        return results.map((result: any) => this.deserialize(result));
    }

    public static on(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void {
        this.emitter.on(event, listener);
    }

    public static off(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void {
        this.emitter.off(event, listener);
    }

    private static get config(): Record<string, any> {
        let config: any;

        const configPath = App.Path.configPath("redis.ts");

        if (fs.existsSync(configPath)) config = require(configPath).default;
        else config = RedisConf;

        return config;
    }

    private static buildUrl(cfg: RedisConfig): string {
        const url = new URL(`redis://${cfg.host}:${cfg.port}`);

        if (isNotEmpty(cfg.password)) url.password = cfg.password as string;
        if (isNotEmpty(cfg.database)) url.pathname = `/${cfg.database}`;

        return url.toString();
    }

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

    private static getOptions(cfg: RedisConfig): Bun.RedisOptions {
        return {
            autoReconnect: true,
            maxRetries: cfg.maxRetries
        };
    }

    private static getConfig(name?: string): RedisConfig {
        const connectionName = defineValue(name, this.config.default);
        const connection = defineValue(
            this.config.connections[connectionName],
            defineValue(
                this.config.connections[defineValue(Bun.env.REDIS_CONNECTION, "local")],
                {
                    host: "127.0.0.1",
                    port: 6379,
                    password: "",
                    database: 0,
                    maxRetries: 10
                }
            )
        );

        if (isEmpty(connection)) throw new RedisException(`Connection "${connectionName}" not found.`);

        return connection;
    }

    private static getClient(name?: string): Bun.RedisClient {
        const connectionName = defineValue(name, this.config.default);

        this.ensureExitHooks();

        if (isEmpty(this.clients[connectionName])) {
            const cfg = this.getConfig(connectionName);
            this.clients[connectionName] = this.createClient(connectionName, cfg);
        }

        return this.clients[connectionName];
    }

    private static serialize(value: any): string {
        if (isEmpty(value)) return "";
        if (typeof value === "object") return JSON.stringify(value);
        if (typeof value === "number" || typeof value === "boolean") return String(value);

        return value;
    }

    private static deserialize(value?: string | null): any {
        if (isEmpty(value)) return null;

        try {
            return JSON.parse(value as string);
        } catch (error) {
            return value;
        }
    }

    private static ensureExitHooks = ((): Function => {
        let initialized = false;

        return (): void => {
            if (initialized) return;

            initialized = true;

            const handleExit = async (signal?: string): Promise<void> => {
                try {
                    await RedisBuilder.disconnect();

                    Logger.setContext("Redis").warn(`Disconnected on "${defineValue(signal, "exit")}".`);
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