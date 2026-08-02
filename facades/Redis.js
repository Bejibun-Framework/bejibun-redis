import RedisBuilder from "../builders/RedisBuilder";
export default class Redis {
    static setClient(cfg, name) {
        return RedisBuilder.setClient(cfg, name);
    }
    static connection(name) {
        return RedisBuilder.connection(name);
    }
    static async connect(name) {
        return RedisBuilder.connect(name);
    }
    static async disconnect(name) {
        return RedisBuilder.disconnect(name);
    }
    static async ping(message, connection, disconnectAfter) {
        return RedisBuilder.ping(message, connection, disconnectAfter);
    }
    static async keys(pattern, connection, disconnectAfter) {
        return RedisBuilder.keys(pattern, connection, disconnectAfter);
    }
    static async get(key, connection, disconnectAfter) {
        return RedisBuilder.get(key, connection, disconnectAfter);
    }
    static async set(key, value, ttl, connection, disconnectAfter) {
        return RedisBuilder.set(key, value, ttl, connection, disconnectAfter);
    }
    static async del(key, connection, disconnectAfter) {
        return RedisBuilder.del(key, connection, disconnectAfter);
    }
    static async exists(key, connection, disconnectAfter) {
        return RedisBuilder.exists(key, connection, disconnectAfter);
    }
    static async incr(key, connection, disconnectAfter) {
        return RedisBuilder.incr(key, connection, disconnectAfter);
    }
    static async decr(key, connection, disconnectAfter) {
        return RedisBuilder.decr(key, connection, disconnectAfter);
    }
    static async incrBy(key, increment, connection, disconnectAfter) {
        return RedisBuilder.incrBy(key, increment, connection, disconnectAfter);
    }
    static async decrBy(key, decrement, connection, disconnectAfter) {
        return RedisBuilder.decrBy(key, decrement, connection, disconnectAfter);
    }
    static async ttl(key, connection, disconnectAfter) {
        return RedisBuilder.ttl(key, connection, disconnectAfter);
    }
    static async expire(key, value, connection, disconnectAfter) {
        return RedisBuilder.expire(key, value, connection, disconnectAfter);
    }
    static async publish(channel, message, connection) {
        return RedisBuilder.publish(channel, message, connection);
    }
    static async subscribe(channel, listener, connection) {
        return RedisBuilder.subscribe(channel, listener, connection);
    }
    static async pipeline(fn, connection) {
        return RedisBuilder.pipeline(fn, connection);
    }
    static on(event, listener) {
        return RedisBuilder.on(event, listener);
    }
    static off(event, listener) {
        return RedisBuilder.off(event, listener);
    }
}
