import App from "@bejibun/app";
import Logger from "@bejibun/logger";
import { defineValue, isEmpty, isNotEmpty } from "@bejibun/utils";
import Str from "@bejibun/utils/facades/Str";
import { EventEmitter } from "events";
import fs from "fs";
import RedisConf from "../config/redis";
import RedisException from "../exceptions/RedisException";
export default class RedisBuilder {
    static clients = {};
    static emitter = new EventEmitter();
    static setClient(cfg, name) {
        const connectionName = defineValue(name, Str.random());
        this.clients[connectionName] = this.createClient(connectionName, cfg);
        return {
            del: (key) => this.del(key, connectionName, isNotEmpty(name)),
            expire: (key, value) => this.expire(key, value, connectionName, isNotEmpty(name)),
            get: (key) => this.get(key, connectionName, isNotEmpty(name)),
            keys: (pattern) => this.keys(pattern, connectionName, isNotEmpty(name)),
            pipeline: (fn) => this.pipeline(fn, connectionName, isNotEmpty(name)),
            publish: (channel, message) => this.publish(channel, message, connectionName),
            set: (key, value, ttl) => this.set(key, value, ttl, connectionName, isNotEmpty(name)),
            subscribe: (channel, listener) => this.subscribe(channel, listener, connectionName),
            ttl: (key) => this.ttl(key, connectionName, isNotEmpty(name))
        };
    }
    static connection(name) {
        return {
            del: (key) => this.del(key, name),
            expire: (key, value) => this.expire(key, value, name),
            get: (key) => this.get(key, name),
            keys: (pattern) => this.keys(pattern, name),
            pipeline: (fn) => this.pipeline(fn, name),
            publish: (channel, message) => this.publish(channel, message, name),
            set: (key, value, ttl) => this.set(key, value, ttl, name),
            subscribe: (channel, listener) => this.subscribe(channel, listener, name),
            ttl: (key) => this.ttl(key, name)
        };
    }
    static async connect(name) {
        const client = this.getClient(name);
        await client.connect();
        Logger.setContext("Redis").info(`Connected manually to "${defineValue(name, "default")}" connection.`);
        this.emitter.emit("connect", defineValue(name, "default"));
        return client;
    }
    static async disconnect(name) {
        if (isNotEmpty(name)) {
            const client = this.clients[name];
            await client?.close();
            delete this.clients[name];
        }
        else {
            for (const [_, client] of Object.entries(this.clients)) {
                await client?.close();
            }
            this.clients = {};
        }
    }
    static async keys(pattern, connection, disconnectAfter = true) {
        try {
            const response = await this.getClient(connection).keys(pattern);
            if (disconnectAfter)
                await this.disconnect(connection);
            return response;
        }
        catch (error) {
            Logger.setContext("Redis").error("Failed to get value.").trace(error);
            return [];
        }
    }
    static async get(key, connection, disconnectAfter = true) {
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
    static async set(key, value, ttl, connection, disconnectAfter = true) {
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
    static async del(key, connection, disconnectAfter = true) {
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
    static async ttl(key, connection, disconnectAfter = true) {
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
    static async expire(key, value, connection, disconnectAfter = true) {
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
    static async subscribe(channel, listener, connection) {
        const client = this.getClient(connection);
        this.clients[channel] = client;
        try {
            await client.subscribe(channel, (message, channel) => listener(this.deserialize(message), channel));
            Logger.setContext("Redis").info(`Subscribed to "${channel}" channel.`);
        }
        catch (error) {
            Logger.setContext("Redis").error(`Failed to subscribe "${channel}" channel.`).trace(error);
        }
        const unsubscribe = async () => {
            try {
                await client.unsubscribe(channel);
                await client.close();
                Logger.setContext("Redis").warn(`Unsubscribed from "${channel}" channel.`);
                return true;
            }
            catch (error) {
                Logger.setContext("Redis").error(`Failed to unsubscribe from "${channel}" channel.`).trace(error);
                return false;
            }
        };
        return {
            client,
            unsubscribe: unsubscribe
        };
    }
    static async pipeline(fn, connection, disconnectAfter = true) {
        const client = this.getClient(connection);
        const ops = [];
        const pipe = {
            del: (key) => {
                ops.push(client.del(key));
            },
            get: (key) => {
                ops.push(client.get(key));
            },
            set: (key, value, ttl) => {
                const serialized = this.serialize(value);
                const data = client.set(key, serialized);
                if (isNotEmpty(ttl))
                    ops.push(client.expire(key, ttl));
                ops.push(data);
            }
        };
        fn(pipe);
        const results = await Promise.all(ops);
        if (disconnectAfter)
            await this.disconnect(connection);
        return results.map((result) => this.deserialize(result));
    }
    static on(event, listener) {
        this.emitter.on(event, listener);
    }
    static off(event, listener) {
        this.emitter.off(event, listener);
    }
    static get config() {
        let config;
        const configPath = App.Path.configPath("redis.ts");
        if (fs.existsSync(configPath))
            config = require(configPath).default;
        else
            config = RedisConf;
        return config;
    }
    static buildUrl(cfg) {
        const url = new URL(`redis://${cfg.host}:${cfg.port}`);
        if (isNotEmpty(cfg.password))
            url.password = cfg.password;
        if (isNotEmpty(cfg.database))
            url.pathname = `/${cfg.database}`;
        return url.toString();
    }
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
    static getOptions(cfg) {
        return {
            autoReconnect: true,
            maxRetries: cfg.maxRetries
        };
    }
    static getConfig(name) {
        const connectionName = defineValue(name, this.config.default);
        const connection = defineValue(this.config.connections[connectionName], defineValue(this.config.connections[defineValue(Bun.env.REDIS_CONNECTION, "local")], {
            host: "127.0.0.1",
            port: 6379,
            password: "",
            database: 0,
            maxRetries: 10
        }));
        if (isEmpty(connection))
            throw new RedisException(`Connection "${connectionName}" not found.`);
        return connection;
    }
    static getClient(name) {
        const connectionName = defineValue(name, this.config.default);
        this.ensureExitHooks();
        if (isEmpty(this.clients[connectionName])) {
            const cfg = this.getConfig(connectionName);
            this.clients[connectionName] = this.createClient(connectionName, cfg);
        }
        return this.clients[connectionName];
    }
    static serialize(value) {
        if (isEmpty(value))
            return "";
        if (typeof value === "object")
            return JSON.stringify(value);
        if (typeof value === "number" || typeof value === "boolean")
            return String(value);
        return value;
    }
    static deserialize(value) {
        if (isEmpty(value))
            return null;
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    }
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
