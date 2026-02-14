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

    public static async keys(pattern: string, connection?: string): Promise<Array<string>> {
        return RedisBuilder.keys(pattern, connection);
    }

    public static async get(key: Bun.RedisClient.KeyLike, connection?: string): Promise<any> {
        return RedisBuilder.get(key, connection);
    }

    public static async set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string): Promise<number | "OK"> {
        return RedisBuilder.set(key, value, ttl, connection);
    }

    public static async del(key: Bun.RedisClient.KeyLike, connection?: string): Promise<number> {
        return RedisBuilder.del(key, connection);
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