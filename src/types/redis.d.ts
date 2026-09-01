/** Redis connection configuration. */
export type RedisConfig = {
    /** Hostname or IP address of the Redis server. */
    host: string;

    /** Port of the Redis server. */
    port: number;

    /** Optional password for authentication. */
    password?: string | null;

    /** Optional database index to select. */
    database?: number;

    /** Optional number of connection retry attempts. */
    maxRetries?: number;
};

/** Pipeline interface for enqueuing batched Redis commands. */
export type RedisPipeline = {
    /** Enqueues a decrement command. */
    decr: (key: Bun.RedisClient.KeyLike) => void;

    /** Enqueues a decrement-by command. */
    decrBy: (key: Bun.RedisClient.KeyLike, decrement: number) => void;

    /** Enqueues a delete command. */
    del: (key: Bun.RedisClient.KeyLike) => void;

    /** Enqueues an existence check command. */
    exists: (key: Bun.RedisClient.KeyLike) => void;

    /** Enqueues an expire command. */
    expire: (key: Bun.RedisClient.KeyLike, value: number) => void;

    /** Enqueues a get command. */
    get: (key: Bun.RedisClient.KeyLike) => void;

    /** Enqueues an increment command. */
    incr: (key: Bun.RedisClient.KeyLike) => void;

    /** Enqueues an increment-by command. */
    incrBy: (key: Bun.RedisClient.KeyLike, increment: number) => void;

    /** Enqueues a keys command. */
    keys: (pattern: string) => void;

    /** Enqueues a set command. */
    set: (key: Bun.RedisClient.KeyLike, value: any, ttl?: number) => void;

    /** Enqueues a ttl command. */
    ttl: (key: Bun.RedisClient.KeyLike) => void;
};

/** Subscription handle returned when subscribing to a channel. */
export type RedisSubscribe = {
    /** The client used for the subscription. */
    client: RedisClient;

    /** Unsubscribes from the channel and closes the client. */
    unsubscribe: () => Promise<boolean>;
};
