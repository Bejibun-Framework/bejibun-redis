export type RedisConfig = {
    host: string;
    port: number;
    password?: string | null;
    database?: number;
    maxRetries?: number;
};
export type RedisPipeline = {
    decr: (key: Bun.RedisClient.KeyLike) => void;
    decrBy: (key: Bun.RedisClient.KeyLike, decrement: number) => void;
    del: (key: Bun.RedisClient.KeyLike) => void;
    exists: (key: Bun.RedisClient.KeyLike) => void;
    expire: (key: Bun.RedisClient.KeyLike, value: number) => void;
    get: (key: Bun.RedisClient.KeyLike) => void;
    incr: (key: Bun.RedisClient.KeyLike) => void;
    incrBy: (key: Bun.RedisClient.KeyLike, increment: number) => void;
    keys: (pattern: string) => void;
    set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number) => void;
    ttl: (key: Bun.RedisClient.KeyLike) => void;
};
export type RedisSubscribe = {
    client: RedisClient;
    unsubscribe: () => Promise<boolean>;
};
