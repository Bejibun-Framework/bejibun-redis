import type { RedisConfig, RedisPipeline, RedisSubscribe } from "../types/redis";
export default class Redis {
    static setClient(cfg: RedisConfig): Record<string, Function>;
    static connection(name: string): Record<string, Function>;
    static connect(name?: string): Promise<Bun.RedisClient>;
    static disconnect(name?: string): Promise<void>;
    static get(key: Bun.RedisClient.KeyLike, connection?: string): Promise<any>;
    static set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string): Promise<number | "OK">;
    static del(key: Bun.RedisClient.KeyLike, connection?: string): Promise<number>;
    static publish(channel: string, message: any, connection?: string): Promise<number>;
    static subscribe(channel: string, listener: Bun.RedisClient.StringPubSubListener, connection?: string): Promise<RedisSubscribe>;
    static pipeline(fn: (pipe: RedisPipeline) => void, connection?: string): Promise<any[]>;
    static on(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
    static off(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
}
