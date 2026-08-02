import type {RedisConfig, RedisPipeline, RedisSubscribe} from "@/types/redis";
import RedisBuilder from "@/builders/RedisBuilder";

export default class Redis {
    public static setClient(cfg: RedisConfig, name?: string): Record<string, Function> {
        return RedisBuilder.setClient(cfg, name);
    }

    public static connection(name: string): Record<string, Function> {
        return RedisBuilder.connection(name);
    }

    public static async connect(name?: string): Promise<Bun.RedisClient> {
        return RedisBuilder.connect(name);
    }

    public static async disconnect(name?: string): Promise<void> {
        return RedisBuilder.disconnect(name);
    }

    public static async ping(message?: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<string | boolean> {
        return RedisBuilder.ping(message, connection, disconnectAfter);
    }

    public static async keys(pattern: string, connection?: string, disconnectAfter?: boolean): Promise<Array<string>> {
        return RedisBuilder.keys(pattern, connection, disconnectAfter);
    }

    public static async get(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<any> {
        return RedisBuilder.get(key, connection, disconnectAfter);
    }

    public static async set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string, disconnectAfter?: boolean): Promise<number | "OK"> {
        return RedisBuilder.set(key, value, ttl, connection, disconnectAfter);
    }

    public static async del(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.del(key, connection, disconnectAfter);
    }

    public static async exists(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<boolean> {
        return RedisBuilder.exists(key, connection, disconnectAfter);
    }

    public static async incr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.incr(key, connection, disconnectAfter);
    }

    public static async decr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.decr(key, connection, disconnectAfter);
    }

    public static async incrBy(key: Bun.RedisClient.KeyLike, increment: number, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.incrBy(key, increment, connection, disconnectAfter);
    }

    public static async decrBy(key: Bun.RedisClient.KeyLike, decrement: number, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.decrBy(key, decrement, connection, disconnectAfter);
    }

    public static async ttl(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.ttl(key, connection, disconnectAfter);
    }

    public static async expire(key: Bun.RedisClient.KeyLike, value: number, connection?: string, disconnectAfter?: boolean): Promise<number> {
        return RedisBuilder.expire(key, value, connection, disconnectAfter);
    }

    public static async publish(channel: string, message: any, connection?: string): Promise<number> {
        return RedisBuilder.publish(channel, message, connection);
    }

    public static async subscribe(channel: string, listener: Bun.RedisClient.StringPubSubListener, connection?: string): Promise<RedisSubscribe> {
        return RedisBuilder.subscribe(channel, listener, connection);
    }

    public static async pipeline(fn: (pipe: RedisPipeline) => void, connection?: string) {
        return RedisBuilder.pipeline(fn, connection);
    }

    public static on(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void {
        return RedisBuilder.on(event, listener);
    }

    public static off(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void {
        return RedisBuilder.off(event, listener);
    }
}