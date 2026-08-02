import type { RedisConfig, RedisPipeline, RedisSubscribe } from "../types/redis";
export default class Redis {
    static setClient(cfg: RedisConfig, name?: string): Record<string, Function>;
    static connection(name: string): Record<string, Function>;
    static connect(name?: string): Promise<Bun.RedisClient>;
    static disconnect(name?: string): Promise<void>;
    static ping(message?: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<string | boolean>;
    static keys(pattern: string, connection?: string, disconnectAfter?: boolean): Promise<Array<string>>;
    static get(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<any>;
    static set(key: Bun.RedisClient.KeyLike, value: any, ttl?: number, connection?: string, disconnectAfter?: boolean): Promise<number | "OK">;
    static del(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static exists(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<boolean>;
    static incr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static decr(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static incrBy(key: Bun.RedisClient.KeyLike, increment: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static decrBy(key: Bun.RedisClient.KeyLike, decrement: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static ttl(key: Bun.RedisClient.KeyLike, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static expire(key: Bun.RedisClient.KeyLike, value: number, connection?: string, disconnectAfter?: boolean): Promise<number>;
    static publish(channel: string, message: any, connection?: string): Promise<number>;
    static subscribe(channel: string, listener: Bun.RedisClient.StringPubSubListener, connection?: string): Promise<RedisSubscribe>;
    static pipeline(fn: (pipe: RedisPipeline) => void, connection?: string): Promise<any[]>;
    static on(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
    static off(event: "connect" | "disconnect" | "error", listener: (...args: Array<any>) => void): void;
}
